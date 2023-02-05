import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { useState } from "react"
import { useHistory, useLocation } from "react-router-dom"

import * as api from "../api"
import { Page } from "../components/Page"
import { useFriends, useUser } from "../hooks"
import { pathPlaceDetail } from "../paths"

export function PlacesCreateView() {
  const search = useLocation().search
  const [name, setName] = useState(() => {
    const searchParams = new URLSearchParams(search)
    return searchParams.get("default_name") ?? ""
  })
  const [location, setLocation] = useState("")
  const [saving, setSaving] = useState(false)
  const user = useUser()
  const friends = useFriends(user.data?.uid ?? null)
  const history = useHistory()
  const toast = useToast()

  return (
    <Page>
      <Heading as="h1" size="lg">
        Place
      </Heading>
      <VStack
        as="form"
        width="100%"
        onSubmit={(e) => {
          e.preventDefault()
          if (user.data == null) {
            return
          }
          setSaving(true)
          api
            .placeCreate({
              name,
              location,
              userId: user.data.uid,
              friendIds: friends !== "loading" ? friends.map((f) => f.id) : [],
            })
            .then((docId) => {
              history.push(pathPlaceDetail({ placeId: docId }))
              setSaving(false)
            })
            .catch((error: FirebaseError) => {
              toast({
                title: "Problem creating account",
                description: `${error.code}: ${error.message}`,
                status: "error",
                isClosable: true,
              })
              setSaving(false)
            })
        }}
      >
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            onChange={(e) => {
              setName(e.target.value)
            }}
            value={name}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Location</FormLabel>
          <Input
            type="text"
            onChange={(e) => {
              setLocation(e.target.value)
            }}
            value={location}
          />
        </FormControl>
        <Button
          size="lg"
          type="submit"
          isLoading={saving}
          loadingText="Creating place..."
        >
          Create Place
        </Button>
      </VStack>
    </Page>
  )
}
