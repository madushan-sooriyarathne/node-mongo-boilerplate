import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";

import AppRouter from "./appRouter";
import { Server } from "node:http";
import RateLimiter from "./utils/RateLimiter";
import AntiParameterPolluter from "./utils/AntiParameterPolluter";
import globalErrorHandler from "./utils/ErrorHandlers";

// route handler imports (always import error handling route after importing all other routes)

// take care of unhandled exceptions
process.on("uncaughtException", function (err: Error): void {
  console.error(`${err.name} => ${err.message}`);

  // exit the process
  process.exit(1);
});

// environment variable configs
dotenv.config({ path: path.join(__dirname, "/../config.env") });

// rate limiter configuration
RateLimiter.config({ maxRequestsAmount: 100, timeWindow: 3600 });

const port = process.env.PORT || 3000; // port
let db: string; // mongo db connection string

// create the express server
const app: Express = express();

// static file request serving configurations
app.use(express.static(path.join(__dirname, "public")));

// DB configs depending on the current environment
if (process.env.NODE_ENV === "production") {
  db = process.env.MONGO_PRODUCTION_CONNECTION_STRING as string;
} else {
  db = process.env.MONGO_DEVELOPMENT_CONNECTION_STRING as string;
}

// DB connection
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((): void =>
    console.log(`connected to the ${process.env.NODE_ENV} database.`)
  )
  .catch((error: any): void => {
    console.error(
      `error occurred while connecting to the ${process.env.NODE_ENV} database`
    );
    // exit the process
    process.exit(1);
  });

// Incoming Http request body parser and size limiter
app.use(express.json({ limit: "10kb" }));

// rate limiter middleware
app.use(RateLimiter.limit());

// parameter pollution prevention middleware
app.use(AntiParameterPolluter.preventPollution());

// set the Http Headers using helmet
app.use(helmet());

// global router handler
app.use(AppRouter.getRouter());

// global error handling middleware
app.use(globalErrorHandler);

// listen to server
const server: Server = app.listen(port, (): void => {
  console.log(`Listening to incoming requests on port ${port}`);
});

// take care of unhandled promise rejections
process.on("unhandledRejection", function (err: Error): void {
  console.error(`Unhandled promise rejection -> ${err.message}`);

  // close the server
  server.close(function (): void {
    process.exit(1);
  });
});
