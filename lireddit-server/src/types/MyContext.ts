import { Request, Response } from "express";
import { SessionOptions } from "express-session";
import { Redis } from "ioredis";
import createUpvoteLoader from "../loaders/createUpvoteLoader";
import createUserLoader from "../loaders/createUserLoader";

export type MyContext = {
  redis: Redis;
  req: Request & { session: SessionOptions };
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
