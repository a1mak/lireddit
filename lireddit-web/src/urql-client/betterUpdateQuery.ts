import { Cache, QueryInput, Data } from "@urql/exchange-graphcache";

export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: Data,
  fn: (r: Result, q: Query) => Query
) {
  cache.updateQuery(
    qi,
    (data) =>
      (fn(
        (result as unknown) as Result,
        (data as unknown) as Query
      ) as unknown) as Data | null
  );
}
