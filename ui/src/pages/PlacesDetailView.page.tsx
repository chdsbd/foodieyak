import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  HStack,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import first from "lodash-es/first";
import orderBy from "lodash-es/orderBy";
import { Link, useParams } from "react-router-dom";

import { CheckInRating, PlaceMenuItem } from "../api-schemas";
import { calculateCheckinCountsByMenuItem } from "../api-transforms";
import { DelayedLoader } from "../components/DelayedLoader";
import { EmptyStateText } from "../components/EmptyStateText";
import { LocationImage } from "../components/LocationImage";
import { Page } from "../components/Page";
import { formatHumanDate } from "../date";
import { useCheckins, useMenuItems, usePlace, useUser } from "../hooks";
import { NoMatch } from "./NoMatchView.page";

// function Rating(props: { ratings: PlaceCheckIn["ratings"] }) {
//   const total = props.ratings.length;
//   const positive = props.ratings.filter((x) => x.rating > 0).length;
//   const negative = props.ratings.filter((x) => x.rating < 0).length;
//   return (
//     <Flex>
//       {total} reviews ({positive}↑ {negative}↓)
//     </Flex>
//   );
// }

export function PlacesDetailView() {
  const { placeId }: { placeId: string } = useParams();
  const place = usePlace(placeId);
  const menuitems = useMenuItems(placeId);
  const checkins = useCheckins(placeId);
  const user = useUser();
  if (
    user.data == null ||
    place === "loading" ||
    menuitems == "loading" ||
    checkins == "loading"
  ) {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    );
  }
  if (place === "not_found") {
    return <NoMatch />;
  }

  function ratingForUser(m: PlaceMenuItem): -1 | 0 | 1 {
    if (checkins === "loading") {
      return 0;
    }

    const checkinRatings: { rating: CheckInRating; createdAt: Timestamp }[] =
      [];
    for (const checkin of checkins) {
      for (const rating of checkin.ratings) {
        if (rating.menuItemId === m.id) {
          checkinRatings.push({ rating, createdAt: checkin.createdAt });
        }
      }
    }

    const latestCheckin = first(
      orderBy(checkinRatings, (x) => x.createdAt, ["desc"])
    );
    return latestCheckin?.rating.rating ?? 0;
  }

  const countsByMenuItem = calculateCheckinCountsByMenuItem(checkins);

  return (
    <Page>
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
      <HStack w="100%" alignItems={"stretch"}>
        <Box
          minHeight={"100px"}
          minWidth="100px"
          background={"darkgray"}
          marginRight={4}
        >
          <div />
        </Box>
        <VStack justifyContent={"center"}>
          <div>
            <div>{place.name}</div>
            <div>{place.location}</div>
          </div>
        </VStack>
        <Spacer />
        <VStack alignItems={"start"}>
          <Link to={`/place/${placeId}/edit`}>
            <Button size="sm" variant={"outline"}>
              Edit
            </Button>
          </Link>
        </VStack>
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
          <TabPanel
            paddingX="unset"
            as={VStack}
            justifyContent="space-between"
            w="full"
          >
            {menuitems.length === 0 && (
              <EmptyStateText>No Menu Items</EmptyStateText>
            )}
            {menuitems.map((m) => (
              <HStack w="full" as={Link} to={`/place/${place.id}/menu/${m.id}`}>
                <LocationImage />
                <Text fontSize={"xl"}>{m.name}</Text>
                <Spacer />
                <ButtonGroup>
                  <Button
                    colorScheme={
                      (ratingForUser(m) ?? 0) > 0 ? "green" : undefined
                    }
                  >
                    ↑{countsByMenuItem[m.id]?.positive}
                  </Button>
                  <Button
                    colorScheme={
                      (ratingForUser(m) ?? 0) < 0 ? "red" : undefined
                    }
                  >
                    ↓{countsByMenuItem[m.id]?.negative}
                  </Button>
                </ButtonGroup>
              </HStack>
            ))}
          </TabPanel>
          <TabPanel
            paddingX="unset"
            as={VStack}
            justifyContent="space-between"
            w="full"
          >
            {checkins.length === 0 && (
              <EmptyStateText>No Check-Ins</EmptyStateText>
            )}
            {checkins.map((c) => (
              <HStack
                w="full"
                as={Link}
                to={`/place/${place.id}/check-in/${c.id}`}
              >
                <LocationImage />
                <VStack align={"start"}>
                  <div>{c.createdById}</div>
                  <div>{formatHumanDate(c.createdAt)}</div>
                </VStack>
                <Spacer />
                {/* <Rating ratings={c.ratings} /> */}
              </HStack>
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Page>
  );
}
