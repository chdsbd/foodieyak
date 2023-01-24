import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
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
import { formatHumanDateTime } from "../date"
import { useCheckIn, useMenuItems, usePlace } from "../hooks"
import { UserIdToName } from "./FriendsListView.page"

export function CheckInDetailView() {
  const { placeId, checkInId }: { placeId: string; checkInId: string } =
    useParams()
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
      <Text
        as={Link}
        to={`/place/${place.id}`}
        fontSize="md"
        marginTop={0}
        margin={0}
        fontWeight={500}
        style={{ marginTop: 0 }}
      >
        {place.name}
      </Text>

      <HStack w="full" style={{ marginTop: 0 }}>
        <Heading as="h1" size="md">
          Check-In
        </Heading>
        <Spacer />
        <VStack alignItems={"start"}>
          <Link to={`/place/${place.id}/check-in/${checkIn.id}/edit`}>
            <Button size="sm" variant={"outline"}>
              Edit
            </Button>
          </Link>
        </VStack>
      </HStack>

      <CheckInCommentCard checkIn={checkIn} />

      <Heading as="h2" size="md">
        Menu Items
      </Heading>

      {checkIn.ratings.length === 0 && (
        <EmptyStateText>No Ratings</EmptyStateText>
      )}
      {checkIn.ratings.map((m) => (
        <HStack
          key={m.menuItemId}
          w="full"
          as={Link}
          to={`/place/${place.id}/menu/${m.menuItemId}`}
        >
          <Card w="full" size="sm">
            <HStack as={CardBody} w="full">
              <Text>{menuItemMap[m.menuItemId]?.name}</Text>
              <Spacer />
              <ButtonGroup>
                {m.rating > 0 ? <Upvote /> : <Downvote />}
              </ButtonGroup>
            </HStack>
          </Card>
        </HStack>
      ))}
    </Page>
  )
}
