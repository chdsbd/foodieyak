import {
  Button,
  HStack,
  Spacer,
  FormControl,
  FormLabel,
  Input,
  Tab,
  TabList,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { AuthForm } from "../components/AuthForm";

export function AuthLoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();
  const handleLogin = () => {
    const auth = getAuth();
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        history.push({
          pathname: "/",
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast({
          title: "Problem logging in",
          description: `${errorCode}: ${errorMessage}`,
          status: "error",
          isClosable: true,
        });
        setIsLoading(false);
      });
  };
  return (
    <AuthForm
      onSubmit={() => {
        handleLogin();
      }}
    >
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
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      <HStack width="100%">
        <Button variant="link" as={Link} to="/forgot-password">
          Forgot Password →
        </Button>
        <Spacer />
        <Button isLoading={isLoading} type="submit">
          Login
        </Button>
      </HStack>
    </AuthForm>
  );
}
