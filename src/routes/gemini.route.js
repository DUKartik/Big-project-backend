import { Router } from "express";
import { GetContentIdea } from "../controllers/gemini.controller.js";

const router =Router();

router.route("/get-contentIdea").post(GetContentIdea);

export default router;