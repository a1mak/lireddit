import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]): Record<string, string> =>
  Object.fromEntries(errors.map(({ field, message }) => [field, message]));
