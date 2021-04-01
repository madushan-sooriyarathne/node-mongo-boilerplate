import "reflect-metadata";
import { MetadataKeys } from "../enums";

export function validateBody(...validatorRules: RequestBodyFields[]) {
  return function (target: any, key: string): void {
    Reflect.defineMetadata(
      MetadataKeys.bodyValidator,
      validatorRules,
      target,
      key
    );
  };
}
