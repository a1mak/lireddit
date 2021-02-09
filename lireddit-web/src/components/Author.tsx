import { Text } from "@chakra-ui/react";
import * as React from "react";
import { UserFragment } from "../generated/graphql";

interface AuthorProps {
  author: UserFragment;
}

const Author: React.FunctionComponent<AuthorProps> = ({ author }) => {
  return (
    <Text fontSize="xs">
      posted by{" "}
      <Text as="i" title={author.email}>
        {author.username}
      </Text>
    </Text>
  );
};

export default Author;
