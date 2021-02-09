import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import * as React from "react";
import { PostListItemFragment } from "../generated/graphql";
import Author from "./Author";
import PostButtons from "./PostButtons";
import Vote from "./Vote";

interface PostProps extends PostListItemFragment {}

const Post: React.FC<PostProps> = ({
  id,
  title,
  textSnippet,
  points,
  creator,
  creatorId,
  voteStatus,
}) => {
  return (
    <Flex key={id} p={8} shadow="md" borderWidth={1} flexWrap="nowrap">
      <Vote
        align="center"
        direction="column"
        mr={10}
        postId={id}
        points={points}
        status={voteStatus}
      />
      <Box flexBasis="100%">
        <Box mb={4}>
          <Heading fontSize="l">
            <NextLink href="/post/[id]" as={`/post/${id}`}>
              <Link>{title}</Link>
            </NextLink>
          </Heading>
          <Author author={creator} />
        </Box>
        <Text>{textSnippet}</Text>
      </Box>
      <PostButtons id={id} creatorId={creatorId} />
    </Flex>
  );
};

export default Post;
