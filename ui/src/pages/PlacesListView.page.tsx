import {
  HStack,
  Spacer,
  Button,
  VStack,
  Input,
  Container,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { LocationImage } from "../components/LocationImage";
import { NavigationMoreMenu } from "../components/NavigationMoreMenu";
import { orderBy, first } from "lodash-es";
import { parseISO } from "date-fns";

import * as query from "../query";
import { formatHumanDate } from "../date";
function NavigationBarPlaces() {
  return (
    <HStack w="full">
      <HomeButton />
      <Spacer />

      <NavigationMoreMenu />
      <Link to="/place/create">
        <Button>Add Place</Button>
      </Link>
    </HStack>
  );
}

function usePlaces() {
  const [places, setPlaces] = useState<query.Place[]>([]);
  useEffect(() => {
    query.placeList().then((x) => {
      setPlaces(x);
    });
  }, []);
  return places;
}

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
    <VStack spacing={4}>
      <NavigationBarPlaces />

      <Input placeholder="Search" />

      <Container>
        {places.map((place) => (
          <Link to={`/place/${place.id}`}>
            <HStack>
              <LocationImage />
              <div>
                <div>{place.name}</div>
                <div>{place.location}</div>
                <div>{lastCheckIn(place)}</div>
              </div>
            </HStack>
          </Link>
        ))}
      </Container>
    </VStack>
  );
}
