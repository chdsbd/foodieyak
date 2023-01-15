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
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { useCurrentUser } from "../hooks";

import * as query from "../query";

export function PlacesCreateView() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const user = useCurrentUser();
  const history = useHistory();

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
        <Input
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Location</FormLabel>
        <Input
          type="text"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
        />
      </FormControl>
      <Button
        size="lg"
        onClick={async () => {
          const place = await query.placeCreate({
            name,
            location,
            userId: user.id,
          });
          history.push(`/place/${place.id}`);
        }}
      >
        Create Place
      </Button>
    </VStack>
  );
}
