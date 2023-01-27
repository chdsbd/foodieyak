import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spacer,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { useState } from "react"
import { useHistory } from "react-router-dom"

import * as api from "../api"
import { User } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { useUser } from "../hooks"

export function FriendsCreateView() {
  const toast = useToast()
  const user = useUser()
  const history = useHistory()
  const [email, setEmail] = useState("")
  const [lookupResults, setLookupResults] = useState<User[] | "initial">(
    "initial",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [invitingId, setInvitingId] = useState<string | null>(null)
  if (user.data == null) {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }
  return (
    <Page>
      <VStack
        width="100%"
        as="form"
        onSubmit={(e) => {
          e.preventDefault()
          setIsLoading(true)
          api
            .friendLookup({ email })
            .then((res) => {
              setLookupResults(res)
              setIsLoading(false)
            })
            .catch(() => {
              setIsLoading(false)
              // TODO:
            })
        }}
      >
        <FormControl>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
            }}
          />
          <FormHelperText>Search for a user by email.</FormHelperText>
        </FormControl>
        <HStack width="100%" justify={"end"}>
          <Button type="submit" isLoading={isLoading}>
            Lookup Friend
          </Button>
        </HStack>
        {lookupResults !== "initial" && (
          <>
            <Heading size="md" alignSelf={"start"}>
              Lookup Results
            </Heading>
            {lookupResults.map((r) => (
              <Card key={r.email} w="100%">
                <HStack as={CardBody}>
                  <VStack alignItems={"start"}>
                    <p>{r.displayName}</p>
                    <p>{r.email}</p>
                  </VStack>
                  <Spacer />
                  <Button
                    loadingText="Inviting..."
                    isLoading={r.uid === invitingId}
                    onClick={() => {
                      if (user.data == null) {
                        return
                      }
                      setInvitingId(r.uid)
                      api
                        .friendInviteCreate({
                          userId: user.data.uid,
                          targetUserId: r.uid,
                        })
                        .then(() => {
                          toast({
                            title: "Invite sent",
                            status: "success",
                            isClosable: true,
                          })
                          setInvitingId(null)
                          history.push("/friends")
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
                          setInvitingId(null)
                        })
                    }}
                  >
                    Invite
                  </Button>
                </HStack>
              </Card>
            ))}
            {lookupResults.length === 0 && (
              <EmptyStateText>No Results</EmptyStateText>
            )}
          </>
        )}
      </VStack>
    </Page>
  )
}
