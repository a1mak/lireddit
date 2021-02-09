import { gql } from "@urql/core";
import { cacheExchange, DataField } from "@urql/exchange-graphcache";
import { NextPageContext } from "next";
import { SSRExchange } from "next-urql";
import { ClientOptions, dedupExchange, fetchExchange } from "urql";
import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { invalidateAll } from "./invalidateAll";
import { cursorPagination } from "./cursorPagination";
import { errorExchange } from "./errorExchange";

const createUrqlClient = (
  ssrExchange: SSRExchange,
  ctx?: NextPageContext
): ClientOptions => {
  const cookie = ctx?.req?.headers.cookie || "";

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: { cookie },
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPostResponse: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            vote: (_, args, cache, ___) => {
              interface PostPoints {
                id: DataField;
                points?: number;
                voteStatus?: number | null;
              }

              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment PostPoints on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );

              if (data) {
                const newPoints =
                  data.voteStatus !== value
                    ? data.points + (!data.voteStatus ? 1 : 2) * value
                    : data.points - value;

                cache.writeFragment<PostPoints, VoteMutationVariables>(
                  gql`
                    fragment PostPoints on Post {
                      id
                      points
                      voteStatus
                    }
                  `,
                  {
                    id: postId,
                    points: newPoints,
                    voteStatus: data.voteStatus !== value ? value : null,
                  }
                );
              }
            },
            createPost: (_, __, cache, ___) => {
              invalidateAll(cache, "Query", "posts");
            },
            deletePost: (_, args, cache, __) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            login: (result, _, cache, __) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (r, q) => (r.login.errors ? q : { me: r.login.user })
              );
              invalidateAll(cache, "Query", "posts");
            },
            register: (result, _, cache, __) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (r, q) => (r.register.errors ? q : { me: r.register.user })
              );
            },
            logout: (result, _, cache, __) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                () => ({ me: null })
              );
              invalidateAll(cache, "Query", "posts");
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};

export {
  createUrqlClient,
  betterUpdateQuery,
  invalidateAll,
  cursorPagination,
  errorExchange,
};
