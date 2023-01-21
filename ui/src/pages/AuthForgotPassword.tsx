import {
  Button,
  HStack,
  Spacer,
  FormControl,
  FormLabel,
  Input,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { AuthForm } from "../components/AuthForm";

export function AuthForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const toast = useToast();
  const handlePasswordReset = () => {
    setIsLoading(true);

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setEmail("");
        toast({
          title: "Password Reset Email Sent",
          status: "success",
          isClosable: true,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast({
          title: "Problem Sending Reset Email",
          status: "error",
          description: `${errorCode}: ${errorMessage}`,
          isClosable: true,
        });
        setIsLoading(false);
      });
  };
  return (
    <AuthForm
      onSubmit={() => {
        handlePasswordReset();
      }}
    >
      <Heading as="h1" alignSelf="start" fontSize="xl">
        Forgot Password
      </Heading>
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <HStack width="100%">
        <Button variant="link" as={Link} to="/login">
          Login →
        </Button>
        <Spacer />
        <Button type="submit" isLoading={isLoading}>
          Send Forgot Password Email
        </Button>
      </HStack>
    </AuthForm>
  );
}
