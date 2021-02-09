import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../urql-client";
import { toErrorMap } from "../utils/toErrorMap";

const ForgotPassword = () => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async ({ email }, { setErrors }) => {
          const response = await forgotPassword({ email });

          if (response.data?.forgotPassword.errors) {
            setErrors(toErrorMap(response.data.forgotPassword.errors));
          } else if (response.data?.forgotPassword.complete) {
            setComplete(response.data?.forgotPassword.complete);
          }

          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {complete ? <Box mb={4}>Message has been sent</Box> : null}
            <Box mb={4}>
              <InputField name="email" placeholder="email" label="Email" />
            </Box>
            <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
              Send email
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
