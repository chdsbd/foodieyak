import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Spacer,
  Tab,
  TabList,
  Tabs,
  useToast,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"
import { useState } from "react"
import { Link, useHistory } from "react-router-dom"

import { AuthForm } from "../components/AuthForm"
import { pathLogin, pathPasswordForgot, pathPlaceList } from "../paths"

export function AuthSignupView() {
  const toast = useToast()
  const history = useHistory()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordAgain, setPasswordAgain] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = () => {
    const auth = getAuth()
    if (password !== passwordAgain) {
      toast({
        title: "Problem creating account",
        description: `Passwords do not match`,
        status: "error",
        isClosable: true,
      })
      return
    }
    setIsLoading(true)
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast({
          title: "Account created",
          status: "success",
          isClosable: true,
        })
        history.push({
          pathname: pathPlaceList({}),
        })
      })
      .catch((error: FirebaseError) => {
        const errorCode = error.code
        const errorMessage = error.message
        toast({
          title: "Problem creating account",
          description: `${errorCode}: ${errorMessage}`,
          status: "error",
          isClosable: true,
        })
        setIsLoading(false)
      })
  }
  return (
    <AuthForm
      onSubmit={() => {
        handleSignup()
      }}
    >
      <Tabs index={1} size="lg" width="100%">
        <TabList>
          <Tab as={Link} to={pathLogin({})} fontWeight={500}>
            Login
          </Tab>
          <Tab fontWeight={600}>Signup</Tab>
        </TabList>
      </Tabs>

      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
          }}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
          }}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Password (again)</FormLabel>
        <Input
          type="password"
          value={passwordAgain}
          onChange={(e) => {
            setPasswordAgain(e.target.value)
          }}
        />
      </FormControl>
      <HStack width="100%">
        <Button variant="link" as={Link} to={pathPasswordForgot({})}>
          Forgot Password →
        </Button>
        <Spacer />
        <Button isLoading={isLoading} onClick={handleSignup}>
          Signup
        </Button>
      </HStack>
    </AuthForm>
  )
}
