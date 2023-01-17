import {
  VStack,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Page } from "../components/Page";
import { useUser } from "../hooks";
import * as query from "../fakeDb";

export function FriendsCreateView() {
  const user = useUser();
  const history = useHistory();
  const [email, setEmail] = useState("");
  if (user.data == null) {
    return;
  }
  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/friends">
            Friends
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/friends/add">
            Add
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <VStack
        width="100%"
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          query
            .invitesCreate({
              inviteeEmailAddress: email,
              userId: user.data.uid,
            })
            .then(() => {
              history.push("/friends");
            });
        }}
      >
        <FormControl>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <FormHelperText>An email invitation will be sent.</FormHelperText>
        </FormControl>
        <HStack width="100%" justify={"end"}>
          <Button type="submit">Invite Friend</Button>
        </HStack>
      </VStack>
    </Page>
  );
}
