import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useRegisterMutation } from "../generated/graphql";
import { createUrqlClient } from "../urql-client";
import { toErrorMap } from "../utils/toErrorMap";

const Register = () => {
  const [, register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (data, { setErrors }) => {
          const response = await register({ options: data });

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }

          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mb={4}>
              <InputField
                name="username"
                placeholder="username"
                label="Username"
              />
            </Box>
            <Box mb={4}>
              <InputField
                name="email"
                placeholder="email"
                label="email"
                type="email"
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
            <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
