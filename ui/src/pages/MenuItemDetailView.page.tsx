import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { ThumbsDown, ThumbsUp } from "react-feather";
import { Link } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { LocationImage } from "../components/LocationImage";

export function MenuItemDetailView() {
  const menuItem = {
    name: "Potato",
    positive: 4,
    negative: 2,
    ratings: [
      { name: "Joe Shmoe", date: "2022-11-20", rating: 1 },
      { name: "Tommy Enterprise", date: "2022-11-20", rating: -1 },
    ],
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
          <BreadcrumbLink as={Link} to="/place/tenoch/menu/potato">
            {menuItem.name}
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

      <HStack width="100%">
        <Heading alignSelf={"start"} fontSize="2xl">
          {menuItem.name}
        </Heading>
        <Spacer />
        <ButtonGroup>
          <Button>↑{menuItem.positive}</Button>
          <Button>↓{menuItem.negative}</Button>
        </ButtonGroup>
      </HStack>

      {menuItem.ratings.map((m) => (
        <HStack width="100%">
          <HStack>
            <LocationImage />
            <VStack align="start">
              <div>{m.name}</div>
              <div>{m.date}</div>
            </VStack>
          </HStack>
          <Spacer />
          <ButtonGroup>
            <Button>
              <ThumbsUp fill={m.rating > 0 ? "lightgreen" : "transparent"} />
            </Button>
            <Button>
              <ThumbsDown fill={m.rating < 0 ? "orange" : "transparent"} />
            </Button>
          </ButtonGroup>
        </HStack>
      ))}
    </VStack>
  );
}
