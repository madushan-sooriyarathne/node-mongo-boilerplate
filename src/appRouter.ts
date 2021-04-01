import { Router } from "express";

class AppRouter {
  private static router: Router;

  static getRouter(): Router {
    if (!AppRouter.router) {
      AppRouter.router = Router();
    }

    return AppRouter.router;
  }
}

export default AppRouter;
