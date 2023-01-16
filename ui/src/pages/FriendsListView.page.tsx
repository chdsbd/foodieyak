import {
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  HStack,
  Spacer,
  ButtonGroup,
  Button,
  Input,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { NavBar } from "../components/NavBar";
import { NavigationMoreMenu } from "../components/NavigationMoreMenu";
import { Page } from "../components/Page";

const invites = [
  { email: "person@example.com", createdTs: "2022-10-20" },
  { email: "bear@example.com", createdTs: "2022-10-20" },
];

const friends = [{ email: "sloth@example.com" }];

export function FriendsListView() {
  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/friends">
            Friends
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading as="h2" size="md" alignSelf={"start"}>
        Invites
      </Heading>

      {invites.map((i) => (
        <HStack width={"100%"}>
          <VStack spacing={0} align={"start"}>
            <div>{i.email}</div>
            <div>{i.createdTs}</div>
          </VStack>
          <Spacer />
          <ButtonGroup spacing="6" size={"sm"}>
            <Button colorScheme="blue">Ignore</Button>
            <Button>Accept</Button>
          </ButtonGroup>
        </HStack>
      ))}

      <HStack w="100%" alignItems={"center"}>
        <Heading as="h2" size="md">
          Friends
        </Heading>
        <Spacer />
        <Link to="/friends/add">
          <Button>Add Friend</Button>
        </Link>
      </HStack>
      <Input placeholder="Search" />

      {friends.map((f) => (
        <HStack width="100%">
          <div>{f.email}</div>
          <Spacer />
          <Button size={"sm"}>remove</Button>
        </HStack>
      ))}
    </Page>
  );
}
