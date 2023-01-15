import { Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export function HomeButton() {
  return (
    <Link to="/">
      <Heading as="h1" size="md">
        FoodieYak
      </Heading>
    </Link>
  );
}
