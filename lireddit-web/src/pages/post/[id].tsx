import { Box, Heading, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import Author from "../../components/Author";
import Layout from "../../components/Layout";
import PostButtons from "../../components/PostButtons";
import { usePostQuery } from "../../generated/graphql";
import useIdFromUrl from "../../hooks/useIdFromUrl";
import { createUrqlClient } from "../../urql-client";

const Post = () => {
  const id = useIdFromUrl();
  const [{ data, fetching, error }] = usePostQuery({
    pause: id === -1,
    variables: { id },
  });

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box>{error.message}</Box>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box mb={4}>
        <Heading>{data.post.title}</Heading>
        <Author author={data.post.creator} />
        <PostButtons id={id} creatorId={data.post.creator.id} />
      </Box>
      <Text>{data.post.text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Post);
