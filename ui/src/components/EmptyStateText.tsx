import { Heading, HStack } from "@chakra-ui/react";
import React from "react";

export function EmptyStateText({ children }: { children: React.ReactNode }) {
  return (
    <HStack w="100%" justifyContent={"center"}>
      <Heading size="md" colorScheme={"gray"} textColor={"GrayText"}>
        {children}
      </Heading>
    </HStack>
  );
}
