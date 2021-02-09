import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import useIsAuth from "../hooks/useIsAuth";
import { createUrqlClient } from "../urql-client";

const CreatePost = () => {
  const router = useRouter();
  useIsAuth();
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (data) => {
          const { error } = await createPost({ data });
          if (!error) {
            router.push("/");
          }
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

export default withUrqlClient(createUrqlClient)(CreatePost);
