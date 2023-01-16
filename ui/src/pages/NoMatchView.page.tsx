import { Container } from "@chakra-ui/react";
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
