import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, FlexProps, IconButton, Text } from "@chakra-ui/react";
import * as React from "react";
import { useState } from "react";
import { useVoteMutation } from "../generated/graphql";

interface VoteProps extends FlexProps {
  points: number;
  postId: number;
  status: number | null | undefined;
}

const Vote: React.FunctionComponent<VoteProps> = ({
  points,
  postId,
  status,
  ...flexProps
}) => {
  const [loadingState, setLoadingState] = useState<
    "not-loading" | "loading-upvote" | "loading-downvote"
  >("not-loading");
  const [, vote] = useVoteMutation();

  return (
    <Flex {...flexProps}>
      <IconButton
        aria-label="upvote"
        borderWidth={1}
        colorScheme={status === 1 ? "green" : undefined}
        icon={<ChevronUpIcon />}
        isLoading={loadingState === "loading-upvote"}
        onClick={async () => {
          setLoadingState("loading-upvote");
          await vote({ postId, value: 1 });
          setLoadingState("not-loading");
        }}
      />
      <Text fontSize={20}>{points}</Text>
      <IconButton
        aria-label="downvote"
        borderWidth={1}
        colorScheme={status === -1 ? "red" : undefined}
        icon={<ChevronDownIcon />}
        isLoading={loadingState === "loading-downvote"}
        onClick={async () => {
          setLoadingState("loading-downvote");
          await vote({ postId, value: -1 });
          setLoadingState("not-loading");
        }}
      />
    </Flex>
  );
};

export default Vote;
