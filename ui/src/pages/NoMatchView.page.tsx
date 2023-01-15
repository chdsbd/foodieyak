import { VStack, HStack, Container } from "@chakra-ui/react";
import { HomeButton } from "../components/HomeButton";

export function NoMatch() {
  return (
    <VStack spacing={4}>
      <HStack w="full">
        <HomeButton />
      </HStack>
      <Container>Not Found!</Container>
    </VStack>
  );
}
