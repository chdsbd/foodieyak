import { VStack, HStack, Container } from "@chakra-ui/react";
import { HomeButton } from "../components/HomeButton";
import { NavBar } from "../components/NavBar";
import { Page } from "../components/Page";

export function NoMatch() {
  return (
    <Page>
      <NavBar />
      <Container>Not Found!</Container>
    </Page>
  );
}
