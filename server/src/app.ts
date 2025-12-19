import express from "express";
import cors from 'cors'
import { userRouter } from "./routes/user.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import { authRouter } from "./routes/auth.route";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use(errorMiddleware);

export { app }