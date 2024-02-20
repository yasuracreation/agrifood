import express from "express";
import authController from "../../controller/auth-controller";

const userRoute = express.Router();

userRoute.post("/auth", authController.login);
