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
import { Link } from "react-router-dom";
import { HomeButton } from "../components/HomeButton";
import { LocationImage } from "../components/LocationImage";
import { NavBar } from "../components/NavBar";
import { Page } from "../components/Page";

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

const menu = [
  {
    name: "Potatoes",
    selectedRating: -1,
    rating: {
      positive: 4,
      negative: 2,
    },
  },
  {
    name: "Chicken",
    selectedRating: 1,
    rating: {
      positive: 2,
      negative: 1,
    },
  },
];

function Rating(props: { ratings: typeof checkIns["0"]["ratings"] }) {
  return (
    <Flex>
      {props.ratings.total} items ({props.ratings.positive}↑{" "}
      {props.ratings.negative}↓)
    </Flex>
  );
}

export function PlacesDetailView() {
  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/place/tenoch">
            Tenoch
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
          <div>Tenoch</div>
          <div>Medford, MA</div>
        </div>
      </HStack>
      <Link style={{ width: "100%" }} to="/place/tenoch/check-in">
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
            {menu.map((m) => (
              <HStack w="full" as={Link} to="/place/tenoch/menu/potato">
                <LocationImage />
                <Text fontSize={"xl"}>{m.name}</Text>
                <Spacer />
                <ButtonGroup>
                  <Button
                    colorScheme={m.selectedRating > 0 ? "green" : undefined}
                  >
                    ↑{m.rating.positive}
                  </Button>
                  <Button
                    colorScheme={m.selectedRating < 0 ? "red" : undefined}
                  >
                    ↓{m.rating.negative}
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
            {checkIns.map((c) => (
              <HStack w="full" as={Link} to="/place/tenoch/menu/potato">
                <LocationImage />
                <VStack align={"start"}>
                  <div>{c.name}</div>
                  <div>{c.creationTs}</div>
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
