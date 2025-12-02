import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getDashboardOverview } from "../controllers/dashBoardController";

const dashboardRouter = Router();

dashboardRouter.get(
  '/overview',
  authenticate,
  getDashboardOverview
)

export default dashboardRouter;