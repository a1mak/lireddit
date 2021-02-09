import Router from "next/router";
import { Exchange } from "urql";
import { pipe, tap } from "wonka";

export const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("Not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};
