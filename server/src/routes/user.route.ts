import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.get('/:id', getUserById)
userRouter.post('/', createUser)
userRouter.patch('/:id', authMiddleware, updateUser)
userRouter.delete('/:id', authMiddleware, deleteUser)