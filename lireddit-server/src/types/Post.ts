import { Field, InputType, ObjectType } from "type-graphql";
import { Post } from "../entities/Post";
import { PaginatedResponse } from "./PaginatedResponse";

@InputType()
export class PostData {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
export class PaginatedPostResponse extends PaginatedResponse(Post) {}

// interface Increment {
//   value: 1;
// }
// const IncrementType: Increment = { value: 1 };
// interface Decrement {
//   value: -1;
// }
// const DecrementType: Decrement = { value: -1 };
// export type PostVote = Increment | Decrement;

// export function isPostVote(vote: number): vote is PostVote {
//   return vote === 1 || vote === -1;
// }

// export const PostVoteScalar = new GraphQLUnionType({
//   name: "PostVote",
//   description: "Represents user Upvote/Downvote",
//   types: [IncrementType, DecrementType],
//   resolveType(value) {
//     if (value instanceof IncrementType) {
//       return DogType;
//     }
//     if (value instanceof DecrementType) {
//       return CatType;
//     }
//   },
// });
// export const PostVoteScalar = new GraphQLScalarType({
//   name: "PostVote",
//   description: "Represents user Upvote/Downvote",
//   serialize(value: unknown): string {
//     if (!(typeof value === "number" && isPostVote(value))) {
//       throw new Error("PostVoteScalar can only serialize PostVote values");
//     }

//     return "1"; // value sent to the client
//   },
//   parseValue(value: unknown): PostVote {
//     if (!(typeof value === "number" && isPostVote(value))) {
//       throw new Error("PostVoteScalar can only parse PostVote values");
//     }

//     return -1; // value from the client input variables
//   },
//   parseLiteral(ast): PostVote {
//     // if (!(ast.kind === Kind.INT && isPostVote(parseInt(ast.value)))) {
//     //   throw new Error("PostVoteScalar can only accept 1 or -1");
//     // }

//     switch (ast.kind) {
//       case Kind.BOOLEAN:
//         return 1;
//       case Kind.INT:
//         return -1;
//       default:
//         return 1;
//     }
//   },
// });
