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

import * as api from "../api";

export function PlacesCreateView() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
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
          if (user.data == null) {
            return;
          }
          setSaving(true);
          api
            .placeCreate({ name, location, userId: user.data.uid })
            .then((docId) => {
              history.push(`/place/${docId}`);
              setSaving(false);
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
        <Button
          size="lg"
          type="submit"
          isLoading={saving}
          loadingText="Creating place..."
        >
          Create Place
        </Button>
      </VStack>
    </Page>
  );
}
