import {
  Button,
  HStack,
  Spacer,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Tab,
  TabList,
  Tabs,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AuthHeading } from "./AuthLoginView.page";

export function AuthSignupView() {
  const handleSignup = () => {
    // TODO: create user
  };
  return (
    <VStack spacing={4} marginX="auto" maxWidth={400}>
      <AuthHeading />
      <Tabs index={1} size="lg" width="100%">
        <TabList>
          <Tab as={Link} to="/login" fontWeight={500}>
            Login
          </Tab>
          <Tab fontWeight={600}>Signup</Tab>
        </TabList>
      </Tabs>

      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input type="email" />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input type="password" />
      </FormControl>
      <FormControl>
        <FormLabel>Password (again)</FormLabel>
        <Input type="password" />
      </FormControl>
      <HStack width="100%">
        <Spacer />
        <Button onClick={handleSignup}>Signup</Button>
      </HStack>
    </VStack>
  );
}
