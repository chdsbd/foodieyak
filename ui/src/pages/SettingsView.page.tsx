import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  useColorMode,
  useToast,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { AuthError, getAuth, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"

import * as api from "../api"
import { Page } from "../components/Page"
import { useUser } from "../hooks"
import { pathLogin } from "../paths"

export function SettingsView() {
  const toast = useToast()
  const { colorMode, setColorMode } = useColorMode()
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState<string>("")
  const [updatingDisplayName, setUpdatingDisplayName] = useState(false)
  const userResult = useUser()

  useEffect(() => {
    setDisplayName(userResult.data?.displayName ?? "")
  }, [userResult.data?.displayName])

  const handleLogout = () => {
    const auth = getAuth()
    setIsLoading(true)
    signOut(auth)
      .then(() => {
        localStorage.clear()
        // Workaround for cache issue where we get an error on login after clearing localStorage.
        // If we do a full page refresh, we work around the issue.
        location.pathname = pathLogin({})
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
        <FormLabel>Name</FormLabel>
        <HStack>
          <Input
            placeholder="Enter a nickname"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value)
            }}
          />
          <Button
            loadingText="Updating"
            isLoading={updatingDisplayName}
            onClick={() => {
              setUpdatingDisplayName(true)
              api.user
                .updateProfile({ displayName })
                .then(() => {
                  setUpdatingDisplayName(false)
                })
                .catch((error: AuthError) => {
                  setUpdatingDisplayName(false)
                  toast({
                    title: "Problem creating account",
                    description: `${error.code}: ${error.message}`,
                    status: "error",
                    isClosable: true,
                  })
                })
            }}
          >
            Update
          </Button>
        </HStack>
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
