import express from "express";
import { userRouter } from "./routes/user.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import { authRouter } from "./routes/auth.route";

const app = express();

app.use(express.json());
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use(errorMiddleware);

export { app }