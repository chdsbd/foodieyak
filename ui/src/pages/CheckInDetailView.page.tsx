import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
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
import { useCheckIn, useMenuItems, usePlace } from "../hooks"

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
      <HStack w="full">
        <VStack spacing={0} alignItems="start">
          <Text
            as={Link}
            to={`/place/${place.id}`}
            fontSize="md"
            fontWeight={500}
          >
            {place.name}
          </Text>
          <Heading as="h1" size="md">
            Check-In
          </Heading>
        </VStack>
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

      <Text fontWeight={500}>Menu Items</Text>

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
