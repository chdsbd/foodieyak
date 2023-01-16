import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { NavBar } from "../components/NavBar";
import { Page } from "../components/Page";

export function PlacesCreateView() {
  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/place/create">
            Place
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl>
        <FormLabel>Location</FormLabel>
        <Input type="text" />
      </FormControl>
      <FormControl>
        <FormLabel>Image</FormLabel>
        <Input type="file" />
      </FormControl>
      <Link to="/place/somePlaceId">
        <Button size="lg">Create Place</Button>
      </Link>
    </Page>
  );
}
