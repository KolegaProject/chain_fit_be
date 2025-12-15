const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:56514"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        } else {
        callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

export default corsOptions;