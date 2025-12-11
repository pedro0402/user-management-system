import express from "express";
import { userRouter } from "./routes/user.route";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use('/users', userRouter)
app.use(errorMiddleware);

export { app }