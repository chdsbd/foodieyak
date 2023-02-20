import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Button,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"

import {
  pathFriendsList,
  pathMapList,
  pathPlaceList,
  pathSettingsDetail,
} from "../paths"

function NavigationMoreMenu() {
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        size="sm"
        rightIcon={<ChevronDownIcon />}
      >
        More
      </MenuButton>
      <MenuList>
        <MenuItem as={Link} to={pathMapList({})}>
          Map
        </MenuItem>
        <MenuItem as={Link} to={pathFriendsList({})}>
          Friends
        </MenuItem>
        <MenuItem as={Link} to={pathSettingsDetail({})}>
          Settings
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

function HomeButton() {
  return (
    <Link to={pathPlaceList({})}>
      <Heading as="h1" size="md">
        FoodieYak
      </Heading>
    </Link>
  )
}

export function NavBar({ action }: { action?: JSX.Element }) {
  return (
    <HStack w="full">
      <HomeButton />
      <Spacer />

      {action}

      <NavigationMoreMenu />
    </HStack>
  )
}
