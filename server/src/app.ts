import express from "express";
import cors from 'cors'
import { userRouter } from "./routes/user.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import { authRouter } from "./routes/auth.route";

const app = express();

const allowedOrigins = [
    'http://localhost:5173', // dev vite
    'http://localhost:8080', // prod nginx
];

app.use(cors({
    origin: allowedOrigins
}));

app.use(express.json());
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use(errorMiddleware);

export { app }