import {
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Heading,
  HStack,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { ThumbsDown, ThumbsUp } from "react-feather";
import { Link } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { LocationImage } from "../components/LocationImage";

export function CheckInDetailView() {
  const checkIn = {
    date: "2022-11-12",
    menuItems: [
      { name: "Potato", rating: 1 },
      { name: "Pizza", rating: -1 },
    ],
    images: [{ url: "example.com" }],
  };
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

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/place/tenoch">
            Tenoch
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/place/tenoch/check-in/someId">
            {checkIn.date}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <HStack w="100%">
        <LocationImage />
        <div>
          <div>Tenoch</div>
          <div>Medford, MA</div>
        </div>
      </HStack>

      <Text alignSelf={"start"}>{checkIn.date}</Text>

      <Heading as="h2" size="md" alignSelf={"start"}>
        Menu Items
      </Heading>
      {checkIn.menuItems.map((m) => (
        <HStack width="100%">
          <div>{m.name}</div>
          <Spacer />
          <Button>
            {m.rating > 0 ? (
              <ThumbsUp fill="lightgreen" />
            ) : (
              <ThumbsDown fill="orange" />
            )}
          </Button>
        </HStack>
      ))}
      <HStack width="100%" align="start">
        {checkIn.images.map((i) => (
          <LocationImage />
        ))}
      </HStack>
      <Link to="/place/somePlace/check-in">
        <Button width="100%">Modify Check-In</Button>
      </Link>
    </VStack>
  );
}
