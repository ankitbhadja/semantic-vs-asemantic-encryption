import { env } from "@configs";
import dotenv from "dotenv";
import express from "express";
import Routes from "routes";
import "reflect-metadata";

dotenv.config();

export default class Scheduler {
  protected app: express.Application;


  public init() {
    


    // Init Express
    this.app = express();

    // Routing
    const routes = new Routes();
    this.app.use("/", routes.configure());

    // Start server
    this.app.listen(process.env.PORT, () => {
      console.log("The server is running in port localhost:", process.env.PORT);
      
    });
  }
}
