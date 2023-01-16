import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Text,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { LocationImage } from "../components/LocationImage";
import { useCurrentUser } from "../hooks";
import { PlaceCheckIn, Place, placeGet } from "../query";
import { NoMatch } from "./NoMatchView.page";
import { flatten, groupBy, first, orderBy, uniqBy } from "lodash-es";

function Rating(props: { ratings: PlaceCheckIn["ratings"] }) {
  const total = props.ratings.length;
  const positive = props.ratings.filter((x) => x.rating > 0).length;
  const negative = props.ratings.filter((x) => x.rating < 0).length;
  return (
    <Flex>
      {total} items ({positive}↑ {negative}↓)
    </Flex>
  );
}

export function usePlace(placeId: string): Place | "loading" | "not_found" {
  const [place, setPlace] = useState<Place | "loading" | "not_found">(
    "loading"
  );
  useEffect(() => {
    placeGet({ id: placeId }).then((res) => {
      if (res != null) {
        setPlace(res);
      } else {
        setPlace("not_found");
      }
    });
  }, [placeId]);
  return place;
}

function menuFromPlace(
  place: Place,
  currentUserId: string
): {
  id: string;
  name: string;
  selfRating: 1 | -1 | null;
  positiveCount: number;
  negativeCount: number;
}[] {
  const menuItemRatingsWithUserId = orderBy(
    flatten(
      place.checkIns.map((c) =>
        c.ratings.map((r) => ({
          ...r,
          userId: c.userId,
          createdAt: c.createdAt,
        }))
      )
    ),
    (x) => x.createdAt,
    ["desc"]
  );
  const latestRatingPerUser = uniqBy(
    menuItemRatingsWithUserId,
    (u) => u.userId + ":" + u.menuItemId
  );
  const ratingsByMenuItemId = groupBy(latestRatingPerUser, (z) => z.menuItemId);
  return place.menuItems.map((x) => ({
    id: x.id,
    name: x.name,
    negativeCount: ratingsByMenuItemId[x.id].filter((y) => y.rating < 0).length,
    positiveCount: ratingsByMenuItemId[x.id].filter((y) => y.rating > 0).length,
    selfRating:
      ratingsByMenuItemId[x.id].find((y) => y.userId === currentUserId)
        ?.rating ?? null,
  }));
}

export function PlacesDetailView() {
  const { placeId }: { placeId: string } = useParams();
  const place = usePlace(placeId);
  const user = useCurrentUser();
  if (place === "loading") {
    return <>loading...</>;
  }
  if (place === "not_found") {
    return <NoMatch />;
  }
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

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to={`/place/${place.id}`}>
            {place.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <HStack w="100%">
        <Box
          minHeight={"100px"}
          minWidth="100px"
          background={"darkgray"}
          marginRight={4}
        >
          <div />
        </Box>
        <div>
          <div>{place.name}</div>
          <div>{place.location}</div>
        </div>
      </HStack>
      <Link style={{ width: "100%" }} to={`/place/${place.id}/check-in`}>
        <Button width="100%">Add a Check-In</Button>
      </Link>
      <Tabs width="100%">
        <TabList>
          <Tab>Menu</Tab>
          <Tab>Check-Ins</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {menuFromPlace(place, user.id).map((m) => (
              <Link to={`/place/${place.id}/menu/${m.id}`}>
                <HStack>
                  <LocationImage />
                  <Text fontSize={"xl"}>{m.name}</Text>
                  <Spacer />
                  <ButtonGroup>
                    <Button
                      colorScheme={m.selfRating ?? 0 > 0 ? "green" : undefined}
                    >
                      ↑{m.positiveCount}
                    </Button>
                    <Button
                      colorScheme={m.selfRating ?? 0 < 0 ? "red" : undefined}
                    >
                      ↓{m.negativeCount}
                    </Button>
                  </ButtonGroup>
                </HStack>
              </Link>
            ))}
          </TabPanel>
          <TabPanel>
            {place.checkIns.map((c) => (
              <Link to={`/place/${place.id}/menu/potato`}>
                <HStack>
                  <LocationImage />
                  <VStack align={"start"}>
                    <div>{c.userId}</div>
                    <div>{c.createdAt}</div>
                  </VStack>
                  <Spacer />
                  <Rating ratings={c.ratings} />
                </HStack>
              </Link>
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
