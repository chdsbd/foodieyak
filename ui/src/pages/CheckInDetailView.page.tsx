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
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { formatHumanDate } from "../date"
import { useCheckIn, useMenuItems, usePlace, useUser } from "../hooks"
import { pathCheckinEdit, pathMenuItemDetail, pathPlaceDetail } from "../paths"
import { UserIdToName } from "./FriendsListView.page"

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
      <HStack w="full" alignItems={"star"}>
        <VStack spacing={0} alignItems="start" w="full">
          <Heading as="h1" size="md">
            Check-In
          </Heading>

          <Text
            as={Link}
            to={pathPlaceDetail({ placeId })}
            fontSize="md"
            fontWeight={500}
          >
            <div>{place.name}</div>
            <div>{place.location}</div>
          </Text>
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

      {/* <CheckInCommentCard checkIn={checkIn} /> */}
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
      {checkIn.comment && (
        <Text whiteSpace={"pre-wrap"}>{checkIn.comment}</Text>
      )}
      <Divider />

      {checkIn.ratings.length === 0 && (
        <EmptyStateText>No Ratings</EmptyStateText>
      )}
      {checkIn.ratings.map((m) => (
        <VStack
          key={m.menuItemId}
          w="full"
          alignItems={"start"}
          as={Link}
          to={pathMenuItemDetail({ placeId, menuItemId: m.menuItemId })}
        >
          <HStack w="full">
            <Text>{menuItemMap[m.menuItemId]?.name}</Text>
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
