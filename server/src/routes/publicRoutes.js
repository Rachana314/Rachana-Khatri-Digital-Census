import express from "express";
import { verifyHouseholdPublic } from "../controller/publicController.js";

const router = express.Router();

router.get("/verify/:householdId", verifyHouseholdPublic);

export default router;