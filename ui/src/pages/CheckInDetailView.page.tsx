import {
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
import { CheckInCommentCard } from "../components/CheckInCommentCard"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { useCheckIn, useMenuItems, usePlace, useUser } from "../hooks"
import { pathCheckinEdit, pathMenuItemDetail, pathPlaceDetail } from "../paths"

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

  const menuItemMap = menuItems.reduce<
    Record<PlaceMenuItem["id"], PlaceMenuItem | undefined>
  >((acc, val) => {
    acc[val.id] = val
    return acc
  }, {})

  return (
    <Page>
      <HStack w="full">
        <VStack spacing={0} alignItems="start">
          <Text
            as={Link}
            to={pathPlaceDetail({ placeId })}
            fontSize="md"
            fontWeight={500}
          >
            {place.name}
          </Text>
          <Text>{place.location}</Text>
          <Heading as="h1" size="md">
            Check-In
          </Heading>
        </VStack>
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

      <CheckInCommentCard checkIn={checkIn} />

      <Text fontWeight={500}>Menu Items</Text>

      {checkIn.ratings.length === 0 && (
        <EmptyStateText>No Ratings</EmptyStateText>
      )}
      {checkIn.ratings.map((m) => (
        <VStack
          key={m.menuItemId}
          w="full"
          as={Link}
          to={pathMenuItemDetail({ placeId, menuItemId: m.menuItemId })}
        >
          <HStack w="full">
            <Text fontWeight={"bold"}>{menuItemMap[m.menuItemId]?.name}</Text>
            <Spacer />
            <ButtonGroup>
              {m.rating > 0 ? <Upvote /> : <Downvote />}
            </ButtonGroup>
          </HStack>
          {m.comment.trim().length > 0 && (
            <>
              <Spacer marginY="2" />
              <Text>{m.comment}</Text>
            </>
          )}
          <Divider />
        </VStack>
      ))}
    </Page>
  )
}
