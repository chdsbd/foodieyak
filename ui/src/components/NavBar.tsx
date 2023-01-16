import { HStack, Spacer, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { HomeButton } from "./HomeButton";
import { NavigationMoreMenu } from "./NavigationMoreMenu";

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
