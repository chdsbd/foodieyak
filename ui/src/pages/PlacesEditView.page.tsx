import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Spacer,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"

import * as api from "../api"
import { Page } from "../components/Page"
import { usePlace, useUser } from "../hooks"

export function PlacesEditView() {
  const { placeId }: { placeId: string } = useParams()
  const user = useUser()
  const history = useHistory()
  const toast = useToast()
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const place = usePlace(placeId)
  useEffect(() => {
    if (place === "loading") {
      return
    }
    setName(place?.name ?? "")
    setLocation(place?.location ?? "")
    // @ts-expect-error null coalesing works here.
  }, [place, place?.name, place?.location])
  if (place === "loading") {
    return (
      <Page>
        <div />
      </Page>
    )
  }

  return (
    <Page>
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
            .placeUpdate({
              placeId,
              name,
              location,
              userId: user.data.uid,
            })
            .then(() => {
              history.push(`/place/${placeId}`)
              setSaving(false)
            })
            .catch((error: FirebaseError) => {
              toast({
                title: "Problem updating place",
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
        <Spacer />
        <ButtonGroup w="100%">
          <Tooltip
            isDisabled={(place.checkInCount ?? 0) === 0}
            label={`Deletion disabled until all (${place.checkInCount}) check-Ins have been deleted.`}
          >
            <Button
              // size="lg"
              type="button"
              colorScheme={"red"}
              variant="outline"
              disabled={(place.checkInCount ?? 0) > 0}
              isLoading={deleting}
              loadingText="Deleting..."
              onClick={() => {
                if (!confirm("Delete place?")) {
                  return
                }
                setDeleting(true)
                api
                  .placeDelete({ placeId })
                  .then(() => {
                    history.push(`/`)
                    setDeleting(false)
                  })
                  .catch((error: FirebaseError) => {
                    const errorCode = error.code
                    const errorMessage = error.message
                    toast({
                      title: "Problem deleting place",
                      description: `${errorCode}: ${errorMessage}`,
                      status: "error",
                      isClosable: true,
                    })
                    setDeleting(false)
                  })
              }}
            >
              Delete Place
            </Button>
          </Tooltip>
          <Spacer />
          <Button
            type="submit"
            isLoading={saving}
            loadingText="Saving place..."
          >
            Update Place
          </Button>
        </ButtonGroup>
      </VStack>
    </Page>
  )
}
