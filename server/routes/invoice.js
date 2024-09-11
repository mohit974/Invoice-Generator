import express from "express";
import { generateInvoice } from "../controllers/invoice.js";
const router = express.Router();

router.post("/invoice", generateInvoice);

export default router;
