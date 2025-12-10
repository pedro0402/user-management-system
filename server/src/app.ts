import express from "express";
import { userRouter } from "./routes/user.route";

const app = express();

app.use(express.json());
app.use('/user', userRouter)

export { app }