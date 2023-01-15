import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  VStack,
  Menu,
  ButtonGroup,
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Flex,
  Text,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { ArrowUp, MoreHorizontal } from "react-feather";
import { Link, Route } from "wouter";
// import * as ICons from '@chakra-ui/icons'

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

function HomeButton() {
  return (
    <Link to="/">
      <Heading as="h1" size="md">
        FoodieYak
      </Heading>
    </Link>
  );
}

function NavigationMoreMenu() {
  return (
    <Menu>
      <MenuButton as={Button} size="md" rightIcon={<ChevronDownIcon />}>
        More
      </MenuButton>
      <MenuList>
        <MenuItem>
          <Link to="/friends">Friends</Link>
        </MenuItem>
        <MenuItem>Settings</MenuItem>
      </MenuList>
    </Menu>
  );
}

function NavigationBarPlaces() {
  return (
    <HStack w="full">
      <HomeButton />
      <Spacer />

      <NavigationMoreMenu />
      <Link to="/place/create">
        <Button>Add Place</Button>
      </Link>
    </HStack>
  );
}
function NavigationBarFriends() {
  return (
    <HStack w="full">
      <HomeButton />
      <Spacer />

      <NavigationMoreMenu />
      <Link to="/friends/add">
        <Button>Add Friend</Button>
      </Link>
    </HStack>
  );
}

function LocationImage() {
  return (
    <Box
      minHeight={"100px"}
      minWidth="100px"
      background={"darkgray"}
      marginRight={2}
    >
      <div />
    </Box>
  );
}

function PlacesListView() {
  return (
    <VStack spacing={4}>
      <NavigationBarPlaces />

      <Input placeholder="Search" />

      <Container>
        {locations.map((l) => (
          <HStack>
            <LocationImage />
            <div>
              <div>{l.name}</div>
              <div>{l.location}</div>
              <div>{l.lastCheckIn}</div>
            </div>
          </HStack>
        ))}
      </Container>
    </VStack>
  );
}

const invites = [
  { email: "person@example.com", createdTs: "2022-10-20" },
  { email: "bear@example.com", createdTs: "2022-10-20" },
];

const friends = [{ email: "sloth@example.com" }];

function FriendsListView() {
  return (
    <VStack spacing={4}>
      <NavigationBarFriends />

      <Heading as="h2" size="md" alignSelf={"start"}>
        Invites
      </Heading>

      {invites.map((i) => (
        <HStack width={"100%"}>
          <VStack spacing={0} align={"start"}>
            <div>{i.email}</div>
            <div>{i.createdTs}</div>
          </VStack>
          <Spacer />
          <ButtonGroup spacing="6" size={"sm"}>
            <Button colorScheme="blue">Ignore</Button>
            <Button>Accept</Button>
          </ButtonGroup>
        </HStack>
      ))}

      <Heading as="h2" size="md" alignSelf={"start"}>
        Friends
      </Heading>
      <Input placeholder="Search" />

      {friends.map((f) => (
        <HStack width="100%">
          <div>{f.email}</div>
          <Spacer />
          <Button size={"sm"}>remove</Button>
        </HStack>
      ))}
    </VStack>
  );
}

function FriendsAddView() {
  return (
    <VStack spacing={4}>
      <HStack w="full">
        <HomeButton />
      </HStack>

      <VStack width="100%">
        <FormControl>
          <FormLabel>Email address</FormLabel>
          <Input type="email" />
          <FormHelperText>An email invitation will be sent.</FormHelperText>
        </FormControl>
        <HStack width="100%" justify={"end"}>
          <Button>Invite Friend</Button>
        </HStack>
      </VStack>
    </VStack>
  );
}

function PlaceCreateView() {
  return (
    <VStack spacing={4}>
      <HStack w="full">
        <HomeButton />
      </HStack>

      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl>
        <FormLabel>Location</FormLabel>
        <Input type="text" />
      </FormControl>
      <FormControl>
        <FormLabel>Image</FormLabel>
        <Input type="file" />
      </FormControl>
      <Button size="lg">Create Check-In</Button>
    </VStack>
  );
}

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

function Rating(props: { ratings: typeof checkIns["0"]["ratings"] }) {
  return (
    <Flex>
      {props.ratings.total} items ({props.ratings.positive}↑{" "}
      {props.ratings.negative}↓)
    </Flex>
  );
}

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

function PlacesDetailView() {
  return (
    <VStack spacing={4}>
      <HStack w="full">
        <HomeButton />
      </HStack>
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
      <Button width="100%">Add a Check-In</Button>
      <Tabs width="100%">
        <TabList>
          <Tab>Menu</Tab>
          <Tab>Check-Ins</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {menu.map((m) => (
              <HStack>
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
          <TabPanel>
            {checkIns.map((c) => (
              <HStack>
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
    </VStack>
  );
}

function App() {
  return (
    <Container padding={2}>
      <Route path="/">
        <PlacesListView />
      </Route>
      <Route path="/place/create">
        <PlaceCreateView />
      </Route>
      <Route path="/place/:id">
        <PlacesDetailView />
      </Route>
      <Route path="/friends">
        <FriendsListView />
      </Route>
      <Route path="/friends/add">
        <FriendsAddView />
      </Route>
      {/* <Route path="/:rest*">404, Not Found!</Route> */}
    </Container>
  );
}

export default App;
