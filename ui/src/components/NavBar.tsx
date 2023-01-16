import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  HStack,
  Spacer,
  Button,
  MenuButton,
  MenuList,
  Menu,
  MenuItem,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { HomeButton } from "./HomeButton";

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
