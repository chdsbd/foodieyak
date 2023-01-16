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
import { Link } from "react-router-dom";
import { Page } from "../components/Page";

export function FriendsCreateView() {
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
      <VStack width="100%">
        <FormControl>
          <FormLabel>Email address</FormLabel>
          <Input type="email" />
          <FormHelperText>An email invitation will be sent.</FormHelperText>
        </FormControl>
        <HStack width="100%" justify={"end"}>
          <Button>Invite Friend</Button>
        </HStack>
      </VStack>
    </Page>
  );
}
