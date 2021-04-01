import "reflect-metadata";
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Router,
} from "express";
import { MetadataKeys, Methods, TypeStrings } from "../enums";
import AppRouter from "../../appRouter";
import AppError from "../../utils/appError";

function handleAsyncErrors(fn: AsyncRequestHandler): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction): void {
    fn(req, res, next).catch((error) => next(error));
  };
}

function validateBody(fields: RequestBodyFields[]): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction): void {
    // throw an error if req.body is empty
    if (!req.body) {
      throw new AppError("The Request does not contain any body values", 406);
    }

    // loop through the
    for (let fieldData of fields) {
      // check if the given field is exists in the body
      if (!req.body[fieldData.name]) {
        throw new AppError(
          `Cannot find ${fieldData.name} in the request body`,
          400
        );
      }

      // check if given field's type is correct
      if (typeof req.body[fieldData.name] !== fieldData.type) {
        throw new AppError(
          `Type of the field "${fieldData.name}" must be ${
            fieldData.type
          }. Instead found ${typeof req.body[fieldData.name]}`
        );
      }
    }
  };
}

/**
 * The decorator function that wraps around the route handler class.
 * This decorator handles all middleware stacks & some generic function that
 * requires by all route handling methods / functions
 * @function
 * @param {string} routePrefix routePrefix for given route handler class. this will affect every route handler method in the handler
 * @returns decorator function that wraps around the route handler class
 */
export function controller(routePrefix: string) {
  return function (target: Function) {
    // get the global router
    const router: Router = AppRouter.getRouter();

    // loop through each property in the decorated class
    for (const key in target.prototype) {
      // route handler method / function
      let routeHandler:
        | RequestHandler
        | AsyncRequestHandler
        | SyncRequestHandler = target.prototype[key];

      // extract the route metadata
      const route: string = Reflect.getMetadata(
        MetadataKeys.route,
        target.prototype,
        key
      );

      // extract the Http Handler method type metadata
      const method: Methods = Reflect.getMetadata(
        MetadataKeys.method,
        target.prototype,
        key
      );

      // check if the method is async and if true, attach a error handler
      const isAsync: boolean = Reflect.getMetadata(
        MetadataKeys.async,
        target.prototype,
        key
      );

      if (isAsync) {
        // attach a error handler to the route handler method and assign back to routeHandler.
        routeHandler = handleAsyncErrors(routeHandler as AsyncRequestHandler);
      }

      // get all middlewares except async ones
      const syncMiddlewares: RequestHandler[] =
        Reflect.getMetadata(MetadataKeys.use, target.prototype, key) || [];

      // get all async middlewares and attach error handler to those functions
      const asyncMiddlewares: RequestHandler[] =
        (Reflect.getMetadata(
          MetadataKeys.useAsync,
          target.prototype,
          key
        ) as AsyncRequestHandler[]).map((middleware: AsyncRequestHandler) =>
          handleAsyncErrors(middleware)
        ) || [];

      // get body content validation rules if mentioned
      // NOTE: The reason for this middleware is specifically used in controller decorator
      // instead of using as a normal middleware with use or asyncUse decorator is that we
      // need ensure that this middleware must run first before any other middlewares.
      const bodyFieldRules: RequestBodyFields[] =
        Reflect.getMetadata(
          MetadataKeys.bodyValidator,
          target.prototype,
          key
        ) || [];

      const bodyValidatorMiddleware: RequestHandler = validateBody(
        bodyFieldRules
      );

      router
        .route(`${routePrefix}${route}`)
        [method](
          bodyValidatorMiddleware,
          ...syncMiddlewares,
          ...asyncMiddlewares,
          routeHandler
        );
    }
  };
}
