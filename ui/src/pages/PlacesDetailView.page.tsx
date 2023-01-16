import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Text,
  ButtonGroup,
  Flex,
  HStack,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import { LocationImage } from "../components/LocationImage";
import { Page } from "../components/Page";
import { usePlace, useUser } from "../hooks";
import { PlaceCheckIn } from "../query";
import { NoMatch } from "./NoMatchView.page";
import { menuFromPlace } from "../transforms";

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

export function PlacesDetailView() {
  const { placeId }: { placeId: string } = useParams();
  const place = usePlace(placeId);
  const user = useUser();
  if (user.data == null) {
    return null;
  }
  if (place === "loading") {
    return <>loading...</>;
  }
  if (place === "not_found") {
    return <NoMatch />;
  }
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
          <TabPanel
            paddingX="unset"
            as={VStack}
            justifyContent="space-between"
            w="full"
          >
            {menuFromPlace(place, user.data.uid).map((m) => (
              <HStack
                w="full"
                as={Link}
                to={`/place/${place.id}/menu/${m.menuItemId}`}
              >
                <LocationImage />
                <Text fontSize={"xl"}>{m.menuItemName}</Text>
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
            ))}
          </TabPanel>
          <TabPanel
            paddingX="unset"
            as={VStack}
            justifyContent="space-between"
            w="full"
          >
            {place.checkIns.map((c) => (
              <HStack
                w="full"
                as={Link}
                to={`/place/${place.id}/check-in/${c.id}`}
              >
                <LocationImage />
                <VStack align={"start"}>
                  <div>{c.userId}</div>
                  <div>{c.createdAt}</div>
                </VStack>
                <Spacer />
                <Rating ratings={c.ratings} />
              </HStack>
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Page>
  );
}
