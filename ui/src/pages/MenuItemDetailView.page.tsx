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
import { useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "react-feather";
import { Link, useParams } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { LocationImage } from "../components/LocationImage";
import { useCurrentUser } from "../hooks";
import * as query from "../query";
import { menuFromPlace } from "../transforms";
import { usePlace } from "./PlacesDetailView.page";

export function MenuItemDetailView() {
  const {
    placeId,
    menuItemId,
  }: {
    placeId: string;
    menuItemId: string;
  } = useParams();
  const place = usePlace(placeId);
  const currentUser = useCurrentUser();

  if (place === "loading") {
    return <>Loading...</>;
  }
  if (place === "not_found") {
    return <>Not Found</>;
  }

  const menuItem = menuFromPlace(place, currentUser.id).find(
    (x) => x.id === menuItemId
  );
  if (menuItem == null) {
    return null;
  }

  const checkInsForMenuItem = place.checkIns
    .map((x) => {
      x.ratings = x.ratings.filter((r) => r.menuItemId === menuItemId);
      return x;
    })
    .filter((x) => x.ratings.length > 0);

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
          <BreadcrumbLink as={Link} to={`/place/${place.id}`}>
            Tenoch
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            as={Link}
            to={`/place/${place.id}/menu/${menuItem.id}`}
          >
            {menuItem.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <HStack w="100%">
        <LocationImage />
        <div>
          <div>{place.id}</div>
          <div>{place.location}</div>
        </div>
      </HStack>

      <HStack width="100%">
        <Heading alignSelf={"start"} fontSize="2xl">
          {menuItem.name}
        </Heading>
        <Spacer />
        <ButtonGroup>
          <Button>↑{menuItem.positiveCount}</Button>
          <Button>↓{menuItem.negativeCount}</Button>
        </ButtonGroup>
      </HStack>

      {checkInsForMenuItem.map((m) => (
        <HStack width="100%">
          <HStack>
            <LocationImage />
            <VStack align="start">
              <div>{m.userId}</div>
              <div>{m.createdAt}</div>
            </VStack>
          </HStack>
          <Spacer />
          <ButtonGroup>
            <Button>
              <ThumbsUp
                fill={m.ratings[0].rating > 0 ? "lightgreen" : "transparent"}
              />
            </Button>
            <Button>
              <ThumbsDown
                fill={m.ratings[0].rating < 0 ? "orange" : "transparent"}
              />
            </Button>
          </ButtonGroup>
        </HStack>
      ))}
    </VStack>
  );
}
