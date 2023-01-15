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
import { CheckIn, Place, placeGet } from "../query";
import { NoMatch } from "./NoMatchView.page";

const checkIns = [
  {
    name: "Joe Shmoe",
    creationTs: "2022-11-20",
    ratings: {
      positive: 4,
      negative: 1,
      total: 5,
    },
  },
];

function Rating(props: { ratings: CheckIn["ratings"] }) {
  const total = props.ratings.length;
  const positive = props.ratings.filter((x) => x.rating > 0).length;
  const negative = props.ratings.filter((x) => x.rating < 0).length;
  return (
    <Flex>
      {total} items ({positive}↑ {negative}↓)
    </Flex>
  );
}

function usePlace(placeId: string): Place | "loading" | "not_found" {
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
            {place.menu.map((m) => (
              <Link to={`/place/${place.id}/menu/${m.id}`}>
                <HStack>
                  <LocationImage />
                  <Text fontSize={"xl"}>{m.name}</Text>
                  <Spacer />
                  <ButtonGroup>
                    <Button
                      colorScheme={
                        m.ratings.find((x) => x.userId === user.id)?.rating ??
                        0 > 0
                          ? "green"
                          : undefined
                      }
                    >
                      ↑
                      {m.ratings.reduce((prev, cur) => {
                        if (cur.rating > 0) {
                          return prev + 1;
                        }
                        return prev;
                      }, 0)}
                    </Button>
                    <Button
                      colorScheme={
                        m.ratings.find((x) => x.userId === user.id)?.rating ??
                        0 < 0
                          ? "red"
                          : undefined
                      }
                    >
                      ↓
                      {m.ratings.reduce((prev, cur) => {
                        if (cur.rating < 0) {
                          return prev + 1;
                        }
                        return prev;
                      }, 0)}
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
