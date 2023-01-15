import {
  HStack,
  Spacer,
  Button,
  VStack,
  Input,
  Container,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { LocationImage } from "../components/LocationImage";
import { NavigationMoreMenu } from "../components/NavigationMoreMenu";

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

type Location = {
  name: string;
  location: string;
  lastCheckIn: string;
};

const locations: Location[] = [
  {
    name: "Tenoch",
    lastCheckIn: "3 days ago",
    location: "Medford, MA",
  },
];

export function PlacesListView() {
  return (
    <VStack spacing={4}>
      <NavigationBarPlaces />

      <Input placeholder="Search" />

      <Container>
        {locations.map((l) => (
          <Link to="/place/tenoch">
            <HStack>
              <LocationImage />
              <div>
                <div>{l.name}</div>
                <div>{l.location}</div>
                <div>{l.lastCheckIn}</div>
              </div>
            </HStack>
          </Link>
        ))}
      </Container>
    </VStack>
  );
}
