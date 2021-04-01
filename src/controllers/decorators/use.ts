import { RequestHandler } from "express";
import "reflect-metadata";
import { MetadataKeys } from "../enums";

function useAsync(...middlewares: RequestHandler[]) {
  return function (target: any, key: string): void {
    // get previous defined middlewares if exists
    const previousMiddlewares: AsyncRequestHandler[] = Reflect.getMetadata(
      MetadataKeys.useAsync,
      target,
      key
    );

    Reflect.defineMetadata(
      MetadataKeys.useAsync,
      [...previousMiddlewares, ...middlewares],
      target,
      key
    );
  };
}

function use(...middlewares: RequestHandler[]) {
  return function (target: any, key: string): void {
    // get previous middlewares if exists
    const previousMiddlewares: RequestHandler[] = Reflect.getMetadata(
      MetadataKeys.async,
      target,
      key
    );

    Reflect.defineMetadata(
      MetadataKeys.use,
      [...previousMiddlewares, ...middlewares],
      target,
      key
    );
  };
}

export { useAsync, use };
