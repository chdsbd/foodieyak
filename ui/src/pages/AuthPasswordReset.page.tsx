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
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";

function AuthHeading() {
  return (
    <HStack alignItems="center" marginTop="4">
      <Link to="/">
        <Heading as="h1" size="lg" fontWeight={500}>
          FoodieYak
        </Heading>
      </Link>
    </HStack>
  );
}

export function AuthPasswordReset() {
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const handlePasswordReset = () => {
    // TODO: login user
  };
  return (
    <AuthForm
      onSubmit={() => {
        handlePasswordReset();
      }}
    >
      <Heading as="h1" alignSelf="start" fontSize="xl">
        Update Password
      </Heading>
      <FormControl>
        <FormLabel>New Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>New Password (again)</FormLabel>
        <Input
          type="password"
          value={passwordAgain}
          onChange={(e) => setPasswordAgain(e.target.value)}
        />
      </FormControl>
      <HStack width="100%">
        <Button variant="link" as={Link} to="/login">
          Login →
        </Button>
        <Spacer />
        <Button type="submit">Update Password</Button>
      </HStack>
    </AuthForm>
  );
}
