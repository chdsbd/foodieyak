import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link, useParams } from "react-router-dom"

import { PlaceMenuItem } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { ErrorStateText } from "../components/ErrorStateText"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { formatHumanDate } from "../date"
import { useCheckIn, useMenuItems, usePlace, useUser } from "../hooks"
import { pathCheckinEdit, pathPlaceDetail } from "../paths"
import { startCase } from "../textutils"
import { UserIdToName } from "./FriendsListView.page"

function Comment({ children }: { children: string }) {
  return (
    <Box>
      <Text
        borderLeftWidth={"medium"}
        paddingX="2"
        paddingBottom="1"
        whiteSpace={"pre-wrap"}
      >
        {children}
      </Text>
    </Box>
  )
}

export function CheckInDetailView() {
  const { placeId, checkInId }: { placeId: string; checkInId: string } =
    useParams()
  const user = useUser()
  const place = usePlace(placeId)
  const checkIn = useCheckIn(placeId, checkInId)
  const menuItems = useMenuItems(placeId)

  if (place === "loading" || checkIn === "loading" || menuItems === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  if (place === "error" || checkIn === "error" || menuItems === "error") {
    return (
      <Page>
        <ErrorStateText>
          Problem loading place with id: {placeId}
        </ErrorStateText>
      </Page>
    )
  }

  const menuItemMap = menuItems.reduce<
    Record<PlaceMenuItem["id"], PlaceMenuItem | undefined>
  >((acc, val) => {
    acc[val.id] = val
    return acc
  }, {})

  return (
    <Page>
      <HStack w="full" alignItems={"star"}>
        <Heading size="md" fontWeight={500}>
          <Text
            as={Link}
            color={place?.isSkippableAt ? "gray.600" : undefined}
            textDecorationLine={
              place?.isSkippableAt ? "line-through" : undefined
            }
            to={pathPlaceDetail({ placeId })}
          >
            {place.name}
          </Text>{" "}
          / Check-In
        </Heading>

        <Spacer />
        {checkIn.createdById === user.data?.uid && (
          <VStack alignItems={"start"}>
            <Link to={pathCheckinEdit({ placeId, checkInId })}>
              <Button size="sm" variant={"outline"}>
                Edit
              </Button>
            </Link>
          </VStack>
        )}
      </HStack>

      <HStack w="full" justifyContent={"space-between"}>
        <Text as="span" fontWeight={"bold"}>
          <UserIdToName userId={checkIn.createdById} />
        </Text>
        {checkIn.checkedInAt != null && (
          <Text as="span" fontSize="md" marginLeft="auto">
            {formatHumanDate(checkIn.checkedInAt)}
          </Text>
        )}
      </HStack>
      {checkIn.comment && <Text>{checkIn.comment}</Text>}

      <Divider />
      <Spacer />

      {checkIn.ratings.length === 0 && (
        <EmptyStateText>No Ratings</EmptyStateText>
      )}
      {checkIn.ratings.map((m) => (
        <VStack key={m.menuItemId} w="full">
          <HStack w="full" alignItems="start">
            <VStack w="full" alignItems={"start"}>
              <Text>{startCase(menuItemMap[m.menuItemId]?.name ?? "")}</Text>
              {m.comment.trim().length > 0 && <Comment>{m.comment}</Comment>}
            </VStack>
            <ButtonGroup>
              {m.rating > 0 ? <Upvote /> : <Downvote />}
            </ButtonGroup>
          </HStack>
          <Spacer />
        </VStack>
      ))}
    </Page>
  )
}
