import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import * as React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import useIdFromUrl from "../../../hooks/useIdFromUrl";
import { createUrqlClient } from "../../../urql-client";

const EditPost = () => {
  const router = useRouter();
  const id = useIdFromUrl();
  const [{ data, fetching }] = usePostQuery({
    pause: id === -1,
    variables: { id },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
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
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (data) => {
          await updatePost({ id, ...data });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mb={4}>
              <InputField name="title" placeholder="title" label="Title" />
            </Box>
            <Box mb={4}>
              <InputField
                name="text"
                placeholder="put your text here..."
                label="Body"
                textarea={true}
              />
            </Box>
            <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
              Publish post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
