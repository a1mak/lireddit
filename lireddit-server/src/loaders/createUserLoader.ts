import DataLoader from "dataloader";
import { User } from "../entities/User";

const createUserLoader = () => {
  return new DataLoader<number, User | undefined>(async (keys) => {
    const ids = keys.map((x) => x);
    const users = await User.findByIds(ids);

    return ids.map((id) => users.find((user) => user.id === id));
  });
};

export default createUserLoader;
