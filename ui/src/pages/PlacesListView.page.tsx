import { HStack, Button, VStack, Input } from "@chakra-ui/react";
import { LocationImage } from "../components/LocationImage";
import { orderBy, first } from "lodash-es";
import { parseISO } from "date-fns";

import * as query from "../query";
import { formatHumanDate } from "../date";

import { Link } from "react-router-dom";
import { usePlaces } from "../hooks";
import { Page } from "../components/Page";
import { EmptyStateText } from "../components/EmptyStateText";

function lastCheckIn(place: query.Place): string | undefined {
  const latestCheckIn = first(
    orderBy(place.checkIns, (x) => x.createdAt, ["desc"])
  );
  if (latestCheckIn != null) {
    return formatHumanDate(parseISO(latestCheckIn.createdAt));
  }
}

export function PlacesListView() {
  const places = usePlaces();
  return (
    <Page
      action={
        <Link to="/place/create">
          <Button>Add Place</Button>
        </Link>
      }
    >
      {places.length === 0 && <EmptyStateText>No Places</EmptyStateText>}
      {places.length > 0 && <Input placeholder="Search" />}

      <VStack w="full">
        {places.map((place) => (
          <HStack as={Link} to={`/place/${place.id}`} w="full">
            <LocationImage />
            <div>
              <div>{place.name}</div>
              <div>{place.location}</div>
              <div>{lastCheckIn(place)}</div>
            </div>
          </HStack>
        ))}
      </VStack>
    </Page>
  );
}
