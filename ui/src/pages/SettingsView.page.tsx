import {
  Button,
  VStack,
  FormControl,
  FormLabel,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { useHistory } from "react-router-dom";

export function SettingsView() {
  const toast = useToast();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const handleLogout = () => {
    const auth = getAuth();
    setIsLoading(true);
    signOut(auth)
      .then(() => {
        history.push({ pathname: "/login" });
      })
      .catch((error) => {
        // An error happened.
        toast({
          title: "Problem logging out",
          description: `${error.code}: ${error.message}`,
          variant: "error",
          isClosable: true,
        });
        setIsLoading(false);
      });
  };
  const email = "foo@example.com";
  return (
    <VStack spacing={4} alignItems="start" marginX="auto" maxWidth={600}>
      <Heading as="h1" size="lg">
        Settings
      </Heading>

      <FormControl>
        <FormLabel>Email</FormLabel>
        <div>{email}</div>
      </FormControl>
      <Button onClick={handleLogout} isLoading={isLoading}>
        Logout
      </Button>
    </VStack>
  );
}
