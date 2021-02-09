import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/MyContext";
import { PaginatedPostResponse, PostData } from "../types/Post";

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post): string {
    const slicedText = post.text.slice(0, 200);
    return slicedText.length < post.text.length
      ? slicedText + "..."
      : slicedText;
  }

  @FieldResolver(() => User)
  creator(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ): Promise<User | undefined> {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { upvoteLoader, req }: MyContext
  ): Promise<number | null> {
    if (!req.session.userId) {
      return null;
    }

    const upvote = await upvoteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return upvote?.value || null;
  }

  @Query(() => PaginatedPostResponse)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPostResponse> {
    const normalizedLimit = Math.min(50, limit);
    const normalizedLimitPlusOne = normalizedLimit + 1;
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .select("p.*")
      .orderBy("p.createdAt", "DESC")
      .limit(normalizedLimitPlusOne);

    if (cursor) {
      qb.where("p.createdAt < :cursor", {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await qb.getRawMany();

    return {
      items: posts.slice(0, normalizedLimit),
      hasMore: posts.length === normalizedLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["creator"] });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session;
    const normalizedValue = value > 0 ? 1 : -1;
    const upvote = await Upvote.findOne({
      postId,
      userId,
    });

    return getConnection().transaction(async (transactionalEM) => {
      // If vote exists and value is the same then unvote
      if (upvote && upvote.value === normalizedValue) {
        await transactionalEM.delete(Upvote, {
          userId,
          postId,
        });
        await transactionalEM.update(
          Post,
          { id: postId },
          { points: () => `points - ${normalizedValue}` }
        );
      }
      // If vote exists and value is opposite then update with new value
      else if (upvote && upvote.value !== normalizedValue) {
        await transactionalEM.update(
          Upvote,
          {
            userId,
            postId,
          },
          {
            value: normalizedValue,
          }
        );

        await transactionalEM.update(
          Post,
          { id: postId },
          { points: () => `points + ${2 * normalizedValue}` }
        );
      }
      // If vote doesn't exist than create it
      else {
        await transactionalEM.insert(Upvote, {
          userId,
          postId,
          value: normalizedValue,
        });

        await transactionalEM.update(
          Post,
          { id: postId },
          { points: () => `points + ${normalizedValue}` }
        );
      }

      return true;
    });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("data") data: PostData,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...data, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const post = await Post.findOne(id);

    if (!post) {
      return false;
    }

    if (post.creatorId !== req.session.userId) {
      throw new Error("Not authorized");
    }

    await Upvote.delete({ postId: id });
    await Post.delete(id);

    return true;
  }
}
