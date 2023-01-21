import { Button, HStack, Input, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { EmptyStateText } from "../components/EmptyStateText";
import { LocationImage } from "../components/LocationImage";
import { Page } from "../components/Page";
import { usePlaces, useUser } from "../hooks";

export function PlacesListView() {
  const user = useUser();
  const places = usePlaces(user.data?.uid);

  return (
    <Page
      action={
        <Link to="/place/create">
          <Button>Add Place</Button>
        </Link>
      }
    >
      {places !== "loading" && (
        <>
          {places.length === 0 && <EmptyStateText>No Places</EmptyStateText>}
          {places.length > 0 && <Input placeholder="Search" type="search" />}

          <VStack w="full">
            {places.map((place) => (
              <HStack as={Link} to={`/place/${place.id}`} w="full">
                <LocationImage />
                <div>
                  <div>{place.name}</div>
                  <div>{place.location}</div>
                </div>
              </HStack>
            ))}
          </VStack>
        </>
      )}
    </Page>
  );
}
