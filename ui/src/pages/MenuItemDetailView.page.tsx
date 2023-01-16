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
import { Link, useParams } from "react-router-dom";
import { LocationImage } from "../components/LocationImage";
import { Page } from "../components/Page";
import { usePlace, useUser } from "../hooks";
import { menuFromPlace } from "../transforms";

export function MenuItemDetailView() {
  const {
    placeId,
    menuItemId,
  }: {
    placeId: string;
    menuItemId: string;
  } = useParams();
  const place = usePlace(placeId);
  const currentUser = useUser();
  if (currentUser.data == null) {
    return null;
  }

  if (place === "loading") {
    return <>Loading...</>;
  }
  if (place === "not_found") {
    return <>Not Found</>;
  }

  const menuItem = menuFromPlace(place, currentUser.data.uid).find(
    (x) => x.menuItemId === menuItemId
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
    <Page>
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
            to={`/place/${place.id}/menu/${menuItem.menuItemId}`}
          >
            {menuItem.menuItemName}
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
          {menuItem.menuItemName}
        </Heading>
        <Spacer />
        <ButtonGroup>
          <Button>↑{menuItem.positiveCount}</Button>
          <Button>↓{menuItem.negativeCount}</Button>
        </ButtonGroup>
      </HStack>

      {checkInsForMenuItem.map((m) => (
        <HStack
          width="100%"
          as={Link}
          to={`/place/${place.id}/check-in/${m.id}`}
        >
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
    </Page>
  );
}
