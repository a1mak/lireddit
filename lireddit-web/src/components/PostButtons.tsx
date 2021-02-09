import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import * as React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostButtonsProps {
  id: number;
  creatorId: number;
}

const PostButtons: React.FunctionComponent<PostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data: meData }] = useMeQuery();
  const [{ fetching: fetchingD }, deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Flex direction="column" ml={2}>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          icon={<EditIcon />}
          colorScheme="orange"
          aria-label="Edit Post"
          as="a"
          cursor="pointer"
          borderWidth={1}
          mb={2}
        />
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        colorScheme="red"
        aria-label="Delete Post"
        isLoading={fetchingD}
        borderWidth={1}
        onClick={() => deletePost({ id })}
      />
    </Flex>
  );
};

export default PostButtons;
