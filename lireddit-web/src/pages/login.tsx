import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import NavLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../urql-client";
import { toErrorMap } from "../utils/toErrorMap";

const Login = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (data, { setErrors }) => {
          const response = await login(data);

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }

          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mb={4}>
              <InputField
                name="usernameOrEmail"
                placeholder="username or email"
                label="Username or email"
              />
            </Box>
            <Box mb={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mb={2}>
              <NavLink href="/forgot-password">
                <Link ml="auto">forgot password?</Link>
              </NavLink>
            </Flex>
            <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
