import {
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spacer,
  Tooltip,
  useToast,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { useEffect, useState } from "react"
import { Link, useHistory, useParams } from "react-router-dom"

import * as api from "../api"
import { DelayedLoader } from "../components/DelayedLoader"
import { Page } from "../components/Page"
import { ReadonlyInput } from "../components/ReadonlyInput"
import { useCheckins, useMenuItem, usePlace, useUser } from "../hooks"

export function MenuItemEditView() {
  const {
    placeId,
    menuItemId,
  }: {
    placeId: string
    menuItemId: string
  } = useParams()
  const place = usePlace(placeId)
  const menuItem = useMenuItem(placeId, menuItemId)
  const checkIns = useCheckins(placeId)
  const currentUser = useUser()
  const [name, setName] = useState("")
  const [isSaving, setSaving] = useState(false)
  const [isDeleting, setDeleting] = useState(false)
  const toast = useToast()
  const history = useHistory()

  useEffect(() => {
    if (menuItem === "loading") {
      return
    }
    setName(menuItem?.name ?? "")
    // @ts-expect-error null coalesing works here.
  }, [menuItem, menuItem?.name])

  if (
    currentUser.data == null ||
    place === "loading" ||
    menuItem === "loading" ||
    checkIns === "loading"
  ) {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  return (
    <Page>
      <Heading as="h1" size="lg">
        Menu Item
      </Heading>
      <FormControl>
        <FormLabel>Place</FormLabel>
        <HStack>
          <ReadonlyInput value={place.name} />
          <Button
            size="sm"
            as={Link}
            variant="outline"
            to={`/place/${place.id}`}
          >
            View
          </Button>
        </HStack>
      </FormControl>

      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input
          onChange={(e) => {
            setName(e.target.value)
          }}
          value={name}
        />
      </FormControl>
      <Spacer />
      <ButtonGroup w="100%">
        <Link to={`/place/${place.id}/menu/${menuItemId}`}>
          <Button variant={"outline"}>Cancel</Button>
        </Link>
        <Spacer />
        <Button
          isLoading={isSaving}
          loadingText="Saving changes"
          onClick={() => {
            if (currentUser.data == null) {
              return
            }
            setSaving(true)
            api.menuItems
              .update({
                name,
                userId: currentUser.data.uid,
                menuItemId,
                placeId,
              })
              .then(() => {
                history.push(`/place/${place.id}/menu/${menuItemId}`)
                setSaving(false)
              })
              .catch((e: FirebaseError) => {
                toast({
                  title: "Problem updating menu item",
                  description: `${e.code}: ${e.message}`,
                  status: "error",
                })
                setSaving(false)
              })
          }}
        >
          Save Menu Item
        </Button>
      </ButtonGroup>
      <Spacer />
      <Divider />
      <Spacer />

      <Tooltip
        isDisabled={menuItem.checkInCount === 0}
        label={`Deletion disabled until all (${menuItem.checkInCount}) related check-ins have been deleted.`}
      >
        <Button
          type="button"
          colorScheme={"red"}
          variant="outline"
          size="sm"
          disabled={menuItem.checkInCount > 0}
          isLoading={isDeleting}
          loadingText="Deleting..."
          onClick={() => {
            if (currentUser.data == null) {
              return
            }
            setDeleting(true)
            api.menuItems
              .delete({
                menuItemId,
                placeId,
              })
              .then(() => {
                history.push(`/place/${place.id}`)
                setDeleting(false)
              })
              .catch((e: FirebaseError) => {
                toast({
                  title: "Problem deleting menu item",
                  description: `${e.code}: ${e.message}`,
                  status: "error",
                })
                setDeleting(false)
              })
          }}
        >
          Delete Menu Item
        </Button>
      </Tooltip>
    </Page>
  )
}
