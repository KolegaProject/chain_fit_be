import BaseError from "../../base_classes/base-error.js";
import prisma from "../../config/db.js";
import { snap} from "../../config/midtrans.js";
import crypto from "crypto";

class MembershipTransactionService {
  async createSnap(packageId, userId, gymId) {
    return prisma.$transaction(async (tx) => {
      // Cek package + gym
      const membershipPackage = await tx.membershipPackage.findFirst({
        where: {
          id: packageId,
          gymId: gymId,
        },
        include: {
          gym: true,
        },
      });

      if (!membershipPackage) {
        throw BaseError.notFound('membership package not found');
      }

      // Cek apakah user sudah punya membership AKTIF di gym ini
      const existingMembership = await tx.membership.findFirst({
        where: {
          userId: userId,
          gymId: gymId,
          status: 'AKTIF',
          endDate: {
            gte: new Date(), // masih berlaku
          },
        },
      });

      if (existingMembership) {
        throw BaseError.badRequest('user already has an active membership');
      }

      // Hitung harga + admin fee
      const adminFee = 2000; 
      const packagePrice = Number(membershipPackage.price);
      const grossAmount = packagePrice + adminFee;

      // Ambil data user (buat customer_details)
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw BaseError.notFound('user not found');
      }

      // Buat Transaction di DB (status default PENDING)
      const transaction = await tx.transaction.create({
        data: {
          userId: userId,
          gymId: gymId,
          date: new Date(),
          amount: grossAmount,
          type: 'PENDAPATAN',
          note: `Membership package purchase: ${membershipPackage.name}`,
        },
      });

      // Generate orderId (wajib unik untuk Midtrans)
      const orderId = `GYM-${gymId}-${transaction.id}`; 

      // Susun parameter Snap
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          name: user.name,
          email: user.email,
        },
        item_details: [
          {
            id: membershipPackage.id.toString(),
            price: packagePrice,
            quantity: 1,
            name: `${membershipPackage.name} ${membershipPackage.durationDays} Days`,
          },
          {
            id: 'admin_fee',
            price: adminFee,
            quantity: 1,
            name: 'Transaction Fee',
          },
        ],
        metadata: {
          type: 'membership',
          transactionId: transaction.id,
          packageId: membershipPackage.id,
          gymId,
          userId,
        },
      };

      // Panggil Midtrans Snap
      const snapData = await snap.createTransaction(parameter);

      if (!snapData) {
        throw new Error('Failed to create snap');
      }

      // Update Transaction dengan orderId
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          orderId: orderId,
        },
      });

      // Return ke caller (Flutter akan pakai token/redirect_url)
      return {
        token: snapData.token,
        redirectUrl: snapData.redirect_url,
        transactionId: transaction.id,
        orderId,
        grossAmount,
        adminFee,
      };
    });
  }
 

  async updateTransactionStatus(data) {
    const {
      order_id,
      transaction_status,
      payment_type,
      fraud_status,
      metadata,
    } = data;

    console.log(
      `Transaction notification received. Order ID: ${order_id}. Transaction status: ${transaction_status}. Fraud status: ${fraud_status}`
    );

    await prisma.$transaction(async (tx) => {
      // Cari transaksi berdasarkan orderId
      const transaction = await tx.transaction.findUnique({
        where: { orderId: order_id },
        include: { membership: true },
      });

      if (!transaction) {
        console.error('Transaction not found for orderId', order_id);
        return;
      }

      // Idempotency: kalau sudah final, jangan proses ulang
      if (
        transaction.status === 'PAID' ||
        transaction.status === 'FAILED' ||
        transaction.status === 'EXPIRED'
      ) {
        console.log('Transaction already processed', transaction.id);
        return;
      }

      // Map status Midtrans -> status lokal
      let newStatus = 'PENDING';

      if (transaction_status === 'capture') {
        // for credit card
        if (fraud_status === 'accept') {
          newStatus = 'PAID';
        } else {
          newStatus = 'FAILED';
        }

      } else if (transaction_status === 'settlement') {
        newStatus = 'PAID';
      } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
        newStatus = 'FAILED';

      } else if (transaction_status === 'expire') {
        newStatus = 'EXPIRED';

      } else if (transaction_status === 'pending') {
        newStatus = 'PENDING';

      } else {
        newStatus = 'FAILED';

      }

      // Update Transaction (status + paymentMethod)
      console.log("update status transaction");
      
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          paymentMethod: payment_type,
        },
      });

      // checkNewStatus
      if (newStatus !== 'PAID') {
        console.log('Transaction not PAID, skip membership creation', updatedTx.id);
        return;
      }

      // Kalau membership sudah terhubung → jangan buat lagi (idempotent)
      if (updatedTx.membershipId) {
        console.log('Membership already linked to transaction', updatedTx.id);
        return;
      }

      // Ambil package berdasarkan metadata.packageId
      const packageId = metadata?.packageId;
      if (!packageId) {
        console.error('No packageId in metadata for transaction', updatedTx.id);
        return;
      }

      const membershipPackage = await tx.membershipPackage.findUnique({
        where: { id: packageId },
      });

      if (!membershipPackage) {
        console.error('membershipPackage not found for id', packageId);
        return;
      }

      // Hitung start & end date membership
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + membershipPackage.durationDays);

      // Buat Membership baru
      const membership = await tx.membership.create({
        data: {
          userId: updatedTx.userId, 
          gymId: updatedTx.gymId,
          packageId: membershipPackage.id,
          startDate: now,
          endDate,
          status: 'AKTIF',
        },
      });

      // Update transaction.membershipId
      await tx.transaction.update({
        where: { id: updatedTx.id },
        data: { membershipId: membership.id },
      });

      console.log('Membership created & linked to transaction', {
        transactionId: updatedTx.id,
        membershipId: membership.id,
      });
    });

    return true;
  }

    async notificationSnap(data) {
        const hash = crypto.createHash('sha512').update(`${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex');
        console.log("Response Midtrans : ", data);

        if  (data.signature_key !== hash){
            return true;
        }

        if (!data.metadata){
            return true;
        }

        if (data.metadata.type == 'membership'){
            return await this.updateTransactionStatus(data);
        }
        
        return true;
    }
}

export default new MembershipTransactionService();