import "reflect-metadata";
import { MetadataKeys, Methods } from "../enums";

/**
 * @function
 * @param {string} method Bind a method and handlerRoute metadata to the decorated method
 * @returns {(route: string) => ((target: any, key: string) => void)} Decorator function
 */
function routeBinder(method: string) {
  return function (route: string) {
    return function (target: any, key: string): void {
      // define the route
      Reflect.defineMetadata(MetadataKeys.route, route, target, key);

      // define the Http Method
      Reflect.defineMetadata(MetadataKeys.method, method, target, key);
    };
  };
}

export const get = routeBinder(Methods.get);
export const post = routeBinder(Methods.post);
export const put = routeBinder(Methods.put);
export const patch = routeBinder(Methods.patch);
export const del = routeBinder(Methods.del);
export const all = routeBinder(Methods.all);
