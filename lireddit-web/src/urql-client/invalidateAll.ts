import { Cache, Data } from "@urql/exchange-graphcache";

export const invalidateAll = (
  cache: Cache,
  entity: string | Data | null,
  fieldName?: string
) => {
  cache
    .inspectFields(entity)
    .filter((info) => info.fieldName === fieldName)
    .forEach((field) => {
      cache.invalidate(entity, fieldName, field.arguments || {});
    });
};
