import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import NextLink from "next/link";
import * as React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

const NavBar: React.FC<{}> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching: meFetching }] = useMeQuery({ pause: isServer() });
  let navBody: ReactJSXElement | null = null;

  if (meFetching) {
  } else if (data?.me) {
    navBody = (
      <Flex>
        <Box mr={4}>
          <NextLink href="/create-post">
            <Link
              color="white"
              p={2}
              borderWidth={1}
              borderRadius={4}
              fontWeight="semibold"
            >
              Create Post
            </Link>
          </NextLink>
        </Box>
        <Box mr={4} color="white" fontWeight="semibold">
          Hi, {data.me.username}!
        </Box>
        <Button
          color="purple"
          isLoading={logoutFetching}
          onClick={() => {
            logout();
          }}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  } else {
    navBody = (
      <div>
        <NextLink href="/login">
          <Link color="purple" fontWeight="semibold" ml={4}>
            login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="purple" fontWeight="semibold" ml={4}>
            register
          </Link>
        </NextLink>
      </div>
    );
  }

  return (
    <Box position="sticky" top={0} zIndex={99} bg="tomato" p={4}>
      <Flex alignItems="center" maxW={800} m="auto">
        <Heading>
          <NextLink href="/">
            <Link color="purple" fontWeight="semibold" mr={4}>
              LiReddit
            </Link>
          </NextLink>
        </Heading>
        <Box ml="auto">{navBody}</Box>
      </Flex>
    </Box>
  );
};

export default NavBar;
