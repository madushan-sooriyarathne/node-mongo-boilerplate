import "reflect-metadata";
import { MetadataKeys } from "../enums";

/**
 * Define wether current method is a async function or not.
 * @function
 * @param {any} target Reference of the route handler class
 * @param {string} key Name of the current method
 */
export function asyncHandler(target: any, key: string): void {
  Reflect.defineMetadata(MetadataKeys.async, true, target, key);
}
