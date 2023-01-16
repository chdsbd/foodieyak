import { ChevronDownIcon } from "@chakra-ui/icons";
import { MenuButton, Menu, Button, MenuList, MenuItem } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export function NavigationMoreMenu() {
  return (
    <Menu>
      <MenuButton as={Button} size="md" rightIcon={<ChevronDownIcon />}>
        More
      </MenuButton>
      <MenuList>
        <MenuItem>
          <Link to="/friends">Friends</Link>
        </MenuItem>
        <MenuItem>
          <Link to="/settings">Settings</Link>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
