import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import * as React from "react";
import { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../urql-client";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePassword: NextPage<{}> = ({}) => {
  const [, changePassword] = useChangePasswordMutation();
  const [tokenErrorMessage, setTokenErrorMessage] = useState("");
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async ({ newPassword }, { setErrors }) => {
          const response = await changePassword({
            newPassword,
            token:
              typeof router.query.token === "string" ? router.query.token : "",
          });

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenErrorMessage(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push("/");
          }

          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mb={4}>
              <InputField
                name="newPassword"
                placeholder="new password"
                label="New password"
                type="password"
              />
            </Box>
            {tokenErrorMessage ? <Box mb={4}>{tokenErrorMessage}</Box> : null}
            <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
              Change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
