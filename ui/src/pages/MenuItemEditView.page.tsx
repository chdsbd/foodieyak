import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spacer,
  Text,
  Textarea,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { ReadonlyInput } from "../components/ReadonlyInput"
import { formatHumanDate, toISODateString } from "../date"
import { useCheckins, useMenuItem, usePlace, useUser } from "../hooks"
import { notUndefined } from "../type-guards"
import { UserIdToName } from "./FriendsListView.page"

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

  const checkInCountForMenuItem = menuItem?.checkInCount ?? 0

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
        <Button type="submit" isLoading={false} loadingText="Saving place...">
          Save Menu Item
        </Button>
      </ButtonGroup>
      <Spacer />
      <Divider />
      <Spacer />

      <Tooltip
        isDisabled={checkInCountForMenuItem === 0}
        label={`Deletion disabled until all (${checkInCountForMenuItem}) related check-ins have been deleted.`}
      >
        <Button
          type="button"
          colorScheme={"red"}
          variant="outline"
          size="sm"
          disabled={checkInCountForMenuItem > 0}
          isLoading={false}
          loadingText="Deleting..."
        >
          Delete Menu Item
        </Button>
      </Tooltip>
    </Page>
  )
}
