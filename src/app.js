import "dotenv/config";

import { __dirname, __filename } from "./utils/path.js";
import apicache from "apicache";
import compression from "compression";
import cors from "cors";
import errorHandler from "./middlewares/error-handler-middleware.js";
import express from "express";
import helmet from "helmet";
import logger from "./utils/logger.js";
import morgan from "morgan";
import multer from "multer";
import path from "path";

import prisma from "./config/db.js";
import corsOptions from "./config/cors.js";
import AuthRoutes from "./domains/auth/auth-routes.js";
import gymRoute from "./domains/gym/gym.route.js";
import membershipTransactionRoutes from "./domains/transaction/membership/membership-transaction.routes.js";
import attendanceRoute from "./domains/attendance/attendance.route.js";
import equipmentRoute from "./domains/equipment/equipment.route.js";

class ExpressApplication {
    app;
    fileStorage;
    fileFilter;
    constructor(port) {
        this.app = express();
        this.port = port;


        this.fileStorage = multer.memoryStorage();

        this.fileFilter = (req, file, cb) => {
            if (
                file.mimetype === "image/png" ||
                file.mimetype === "image/jpg" ||
                file.mimetype === "image/jpeg"
            ) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        };

        this.app.use(
            multer({
                storage: this.fileStorage,
                fileFilter: this.fileFilter,
                limits: {
                    fileSize: 5 * 1024 * 1024
                }
            }).fields([
                {
                name: "image",
                maxCount: 10,
                },
            ])
        );
        
        this.app.use(express.json({ type: "application/json", limit: "50mb" }));
        this.app.use(express.urlencoded({ extended: false, limit: "50mb" }));

        this.app.use(cors(corsOptions)); 
        //  __init__

        this.configureAssets();
        this.setupRoute();
        this.setupMiddlewares([
            errorHandler,
            express.json(),
            express.urlencoded(),
            apicache.middleware("5 minutes"),
        ]);

        this.setupLibrary([
            process.env.NODE_ENV === "development" ? morgan("dev") : "",
            compression(),
            helmet(),
            // cors(),
        ]);

        
    }
    
    setupMiddlewares(middlewaresArr) {
        middlewaresArr.forEach((middleware) => {
            this.app.use(middleware);
        });
    }

    setupRoute() {
        // Set Route here base (/api/v1)
        this.app.use("/api/v1/auth", AuthRoutes);
        this.app.use("/api/v1/gym", gymRoute);
        this.app.use("/api/v1/transaction", membershipTransactionRoutes);
        this.app.use("/api/v1/attendance", attendanceRoute);
        this.app.use("/api/v1/equipment", equipmentRoute);
    }

    configureAssets() {
        this.app.use(express.static(path.join(__filename, "public")));
    }

    setupLibrary(libraries) {
        libraries.forEach((library) => {
            if (library != "" && library != null) {
                this.app.use(library);
            }
        });
    }

    async start() {
        try {
            await prisma.$connect();
            this.app.listen(this.port, () => {
                logger.info(`🚀 Server running on port ${this.port}`);
            });
        } catch (error) {
                logger.error("❌ Server failed to start:", error);
                process.exit(1);
        }
    }
}

export default ExpressApplication;
