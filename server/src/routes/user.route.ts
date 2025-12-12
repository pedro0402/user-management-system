import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireSelfOrRole } from "../middlewares/role.middleware";

export const userRouter = Router();

userRouter.get('/',authMiddleware, requireSelfOrRole("admin"), getUsers);
userRouter.get('/:id', getUserById)
userRouter.post('/', createUser)
userRouter.patch('/:id', authMiddleware, requireSelfOrRole("admin"), updateUser)
userRouter.delete('/:id', authMiddleware, requireSelfOrRole("admin"), deleteUser)