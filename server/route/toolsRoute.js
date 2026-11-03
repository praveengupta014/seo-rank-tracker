import express from "express";
import { checkMetaTags } from "../controllers/toolsController.js";

const toolsRouter = express.Router();

toolsRouter.get('/meta-tags', checkMetaTags);

export default toolsRouter;
