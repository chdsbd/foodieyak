import {
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  HStack,
  Spacer,
  Button,
  Input,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { EmptyStateText } from "../components/EmptyStateText";
import { Page } from "../components/Page";
import { formatHumanDateTime } from "../date";
import { useFriends, useInvites, useUser } from "../hooks";

export function FriendsListView() {
  const user = useUser();
  const friends = useFriends(user.data?.uid ?? "");
  const invites = useInvites(user.data?.uid ?? "");
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

      {invites.length === 0 && <EmptyStateText>No Invites</EmptyStateText>}
      {invites.map((i) => (
        <HStack width={"100%"}>
          <VStack spacing={0} align={"start"}>
            <div>{i.inviteeEmailAddress}</div>
            <div>{formatHumanDateTime(new Date(i.createdAt))}</div>
          </VStack>
          <Spacer />
          <Button size="sm" colorScheme={"red"} variant="outline">
            Cancel
          </Button>
        </HStack>
      ))}

      <HStack w="100%" alignItems={"center"}>
        <Heading as="h2" size="md">
          Friends
        </Heading>
        <Spacer />
        <Link to="/friends/add">
          <Button>Invite Friend</Button>
        </Link>
      </HStack>
      {friends.length > 0 && <Input placeholder="Search" />}

      {friends.length === 0 && <EmptyStateText>No Friends</EmptyStateText>}
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
