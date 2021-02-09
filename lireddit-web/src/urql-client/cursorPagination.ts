import { Cache, Resolver } from "@urql/exchange-graphcache";

const nestedResolve = (
  cache: Cache,
  entityKey: string,
  fieldKey: string,
  nestedFieldKey: string
) =>
  cache.resolve(cache.resolve(entityKey, fieldKey) as string, nestedFieldKey);

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    if (fieldInfos.length === 0) {
      return undefined;
    }

    const fieldKey = cache.keyOfField(fieldName, fieldArgs) as string;
    const pgItems = nestedResolve(
      cache,
      entityKey,
      fieldKey,
      "items"
    ) as string[];
    let hasMore = true;

    info.partial = !pgItems;

    let items: string[] = [];
    fieldInfos.forEach(({ fieldKey }) => {
      const fiHasMore = nestedResolve(
        cache,
        entityKey,
        fieldKey,
        "hasMore"
      ) as boolean;
      if (!fiHasMore) hasMore = fiHasMore;
      items.push(
        ...(nestedResolve(cache, entityKey, fieldKey, "items") as string[])
      );
    });

    return { __typename: "PaginatedPostResponse", hasMore, items };
  };
};
