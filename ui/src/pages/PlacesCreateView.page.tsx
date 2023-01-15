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

export function PlacesCreateView() {
  return (
    <VStack spacing={4}>
      <HStack w="full">
        <HomeButton />
      </HStack>
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
    </VStack>
  );
}
