import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Page } from "../components/Page";
import { useUser } from "../hooks";

import * as query from "../query";

export function PlacesCreateView() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const user = useUser();
  const history = useHistory();

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

      <VStack
        as="form"
        width="100%"
        onSubmit={(e) => {
          e.preventDefault();
          query
            .placeCreate({
              name,
              location,
              userId: user.id,
            })
            .then((place) => {
              history.push(`/place/${place.id}`);
            });
        }}
      >
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
        <Button size="lg" type="submit">
          Create Place
        </Button>
      </VStack>
    </Page>
  );
}
