import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Page } from "../components/Page";
import { useUser } from "../hooks";

export function SettingsView() {
  const toast = useToast();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const userResult = useUser();
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
  return (
    <Page>
      <Heading as="h1" size="lg">
        Settings
      </Heading>

      <FormControl>
        <FormLabel>Email</FormLabel>
        <div>{userResult.data?.email ?? "-"}</div>
      </FormControl>
      <Button onClick={handleLogout} isLoading={isLoading}>
        Logout
      </Button>
    </Page>
  );
}
