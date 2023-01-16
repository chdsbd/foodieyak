import {
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Heading,
  HStack,
  Spacer,
  VStack,
  FormControl,
  ButtonGroup,
  FormLabel,
  Input,
  Box,
} from "@chakra-ui/react";
import { ThumbsDown, ThumbsUp } from "react-feather";
import { Link } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { Page } from "../components/Page";

export function CheckInCreateView() {
  return (
    <Page>
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
    </Page>
  );
}
