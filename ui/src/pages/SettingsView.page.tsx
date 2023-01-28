import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  useColorMode,
  useToast,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { getAuth, signOut } from "firebase/auth"
import { useState } from "react"
import { useHistory } from "react-router-dom"

import { Page } from "../components/Page"
import { useUser } from "../hooks"
import { pathLogin } from "../paths"

export function SettingsView() {
  const toast = useToast()
  const { colorMode, setColorMode } = useColorMode()
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)
  const userResult = useUser()
  const handleLogout = () => {
    const auth = getAuth()
    setIsLoading(true)
    signOut(auth)
      .then(() => {
        history.push({ pathname: pathLogin({}) })
      })
      .catch((error: FirebaseError) => {
        toast({
          title: "Problem logging out",
          description: `${error.code}: ${error.message}`,
          variant: "error",
          isClosable: true,
        })
        setIsLoading(false)
      })
  }
  return (
    <Page>
      <Heading as="h1" size="lg">
        Settings
      </Heading>

      <FormControl>
        <FormLabel>Email</FormLabel>
        <div>{userResult.data?.email ?? "-"}</div>
      </FormControl>
      <FormControl>
        <FormLabel>Color Mode</FormLabel>
        <RadioGroup
          onChange={(e) => {
            setColorMode(e)
          }}
          value={colorMode}
        >
          <Stack direction="column">
            <Radio value={"light"}>Light</Radio>
            <Radio value={"dark"}>Dark</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      <Spacer paddingY="2" />
      <Button onClick={handleLogout} isLoading={isLoading}>
        Logout
      </Button>
    </Page>
  )
}
