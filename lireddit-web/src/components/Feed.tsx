import { Button, Flex, Heading, Stack } from "@chakra-ui/react";
import * as React from "react";
import { usePostsQuery } from "../generated/graphql";
import Post from "./Post";

interface FeedProps {}

const Feed: React.FunctionComponent<FeedProps> = ({}) => {
  const [variables, setVariables] = React.useState({
    limit: 10,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  return (
    <>
      <Heading fontSize="xl">Newest posts</Heading>
      <br />
      {fetching && !data ? (
        <div>Loading...</div>
      ) : data ? (
        <>
          <Stack spacing={8}>
            {data.posts.items.map((post) =>
              post ? <Post key={post.id} {...post}></Post> : null
            )}
          </Stack>
          <Flex>
            <Button
              m="auto"
              my={8}
              isLoading={fetching}
              disabled={!data.posts.hasMore}
              colorScheme="teal"
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.items[data.posts.items.length - 1].createdAt,
                });
              }}
            >
              {data.posts.hasMore ? "Load more" : "This is it"}
            </Button>
          </Flex>
        </>
      ) : (
        <Flex alignItems="center" justifyContent="center">
          <Heading>No posts yet</Heading>
        </Flex>
      )}
    </>
  );
};

export default Feed;
