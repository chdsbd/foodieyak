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
  Heading,
  useColorMode,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export function AuthHeading() {
  return (
    <HStack alignItems="center" marginTop="4" marginBottom="-4">
      <Link to="/">
        <Heading as="h1" size="lg" fontWeight={500}>
          FoodieYak
        </Heading>
      </Link>
    </HStack>
  );
}

export function AuthLoginView() {
  const handleLogin = () => {
    // TODO: login user
  };
  return (
    <VStack spacing={4} marginX="auto" maxWidth={400}>
      <AuthHeading />
      <Tabs index={0} size="lg" width="100%">
        <TabList>
          <Tab fontWeight={"bold"}>Login</Tab>
          <Tab as={Link} to="/signup" fontWeight={500}>
            Signup
          </Tab>
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
      <HStack width="100%">
        <Spacer />
        <Button onClick={handleLogin}>Login</Button>
      </HStack>
    </VStack>
  );
}
