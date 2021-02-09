import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

const createUpvoteLoader = () => {
  return new DataLoader<{ postId: number; userId: number }, Upvote | undefined>(
    async (keys) => {
      const ids = keys.map((x) => x);
      const upvotes = await Upvote.findByIds(ids);

      return ids.map(({ postId, userId }) =>
        upvotes.find(
          (upvote) => upvote.postId === postId && upvote.userId === userId
        )
      );
    }
  );
};

export default createUpvoteLoader;
