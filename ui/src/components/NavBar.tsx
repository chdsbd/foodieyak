import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  HStack,
  Spacer,
  Button,
  MenuButton,
  MenuList,
  Menu,
  MenuItem,
  Heading,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

function NavigationMoreMenu() {
  return (
    <Menu>
      <MenuButton as={Button} size="md" rightIcon={<ChevronDownIcon />}>
        More
      </MenuButton>
      <MenuList>
        <MenuItem as={Link} to="/friends">
          Friends
        </MenuItem>
        <MenuItem as={Link} to="/settings">
          Settings
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

function HomeButton() {
  return (
    <Link to="/">
      <Heading as="h1" size="md">
        FoodieYak
      </Heading>
    </Link>
  );
}

export function NavBar({ action }: { action?: JSX.Element }) {
  return (
    <HStack w="full">
      <HomeButton />
      <Spacer />

      {action}

      <NavigationMoreMenu />
    </HStack>
  );
}
