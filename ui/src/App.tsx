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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { ArrowUp, MoreHorizontal, ThumbsDown, ThumbsUp } from "react-feather";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
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
          <Link to="/place/tenoch">
            <HStack>
              <LocationImage />
              <div>
                <div>{l.name}</div>
                <div>{l.location}</div>
                <div>{l.lastCheckIn}</div>
              </div>
            </HStack>
          </Link>
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
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/friends">
            Friends
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

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
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/friends">
            Friends
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/friends/add">
            Add
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
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
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/place/create">
            Place
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

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
      <Link to="/place/somePlaceId">
        <Button size="lg">Create Place</Button>
      </Link>
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
          <TabPanel>
            {menu.map((m) => (
              <Link to="/place/tenoch/menu/potato">
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
              </Link>
            ))}
          </TabPanel>
          <TabPanel>
            {checkIns.map((c) => (
              <Link to="/place/tenoch/menu/potato">
                <HStack>
                  <LocationImage />
                  <VStack align={"start"}>
                    <div>{c.name}</div>
                    <div>{c.creationTs}</div>
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

function CheckInCreateView() {
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
          <BreadcrumbLink as={Link} to="/place/tenoch/check-in">
            Check-In
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

      <FormControl>
        <FormLabel>Date</FormLabel>
        <Input type="date" />
      </FormControl>
      <FormControl>
        <FormLabel>Menu Item</FormLabel>
        <Input type="text" />
      </FormControl>
      <FormControl>
        <FormLabel>Rating</FormLabel>
        <ButtonGroup>
          <Button>
            <ThumbsUp />
          </Button>
          <Button>
            <ThumbsDown />
          </Button>
        </ButtonGroup>
      </FormControl>
      <Button>Add another item</Button>
      <FormControl>
        <FormLabel>Images</FormLabel>
        <Input type="file" />
      </FormControl>
      {/* TODO */}
      <Link to="/place/somePlace/check-in/someCheckIn">
        <Button width="100%">Create Check-In</Button>
      </Link>
    </VStack>
  );
}

function CheckInDetailView() {
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

function NoMatch() {
  return (
    <VStack spacing={4}>
      <HStack w="full">
        <HomeButton />
      </HStack>
      <Container>Not Found!</Container>
    </VStack>
  );
}

function MenuItemDetailView() {
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

function App() {
  return (
    <Container padding={2}>
      <Router>
        <Switch>
          <Route path="/place/:place/check-in/:checkin">
            <CheckInDetailView />
          </Route>
          <Route path="/place/:place/menu/:menuitem">
            <MenuItemDetailView />
          </Route>
          <Route path="/place/:id/check-in">
            <CheckInCreateView />
          </Route>
          <Route path="/place/create">
            <PlaceCreateView />
          </Route>
          <Route path="/place/:id">
            <PlacesDetailView />
          </Route>
          <Route path="/friends/add">
            <FriendsAddView />
          </Route>
          <Route path="/friends">
            <FriendsListView />
          </Route>
          <Route path="/" exact>
            <PlacesListView />
          </Route>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Router>
    </Container>
  );
}

export default App;
