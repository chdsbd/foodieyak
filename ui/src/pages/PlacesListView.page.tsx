import { HStack, VStack, Input, Container, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { LocationImage } from "../components/LocationImage";
import { NavBar } from "../components/NavBar";
import { Page } from "../components/Page";

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
    <Page
      action={
        <Link to="/place/create">
          <Button>Add Place</Button>
        </Link>
      }
    >
      <Input placeholder="Search" />

      <VStack>
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
      </VStack>
    </Page>
  );
}
