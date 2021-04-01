import { Request, Response, NextFunction } from "express";

declare global {
  type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next?: NextFunction
  ) => Promise<void>;

  type SyncRequestHandler = (
    req: Request,
    res: Response,
    next?: NextFunction
  ) => void;

  interface RequestBodyFields {
    name: string;
    type: TypeStrings;
  }
}
