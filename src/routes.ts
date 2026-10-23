import { Router } from "express";

export default class Routes {
  public configure() {
    const router = Router();
    router.get("/health-check", (_req, res) => {
      res.status(200).json({ status: "OK" });
    });

    router.all("/*", (req, res) =>
      res.status(404).json({
        error: "Requested URL not found!",
      }),
    );
    return router;
  }
}
