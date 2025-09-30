import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { deleteUser, getUserById, getUsers } from "../controller/userController.js";


const router = express.Router();

//User Management Routes
router.get("/", protect, adminOnly, getUsers); //Get all users (Admin only)
router.get("/:id", protect, adminOnly, getUserById); //Get all users (Admin only)
router.delete("/:id", protect, adminOnly, deleteUser); //Delete users (Admin only)

export default router;
