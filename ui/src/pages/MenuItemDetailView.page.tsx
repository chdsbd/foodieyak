import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link, useParams } from "react-router-dom"

import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { formatHumanDate } from "../date"
import { useCheckins, useMenuItem, usePlace, useUser } from "../hooks"
import { notUndefined } from "../type-guards"
import { UserIdToName } from "./FriendsListView.page"

export function MenuItemDetailView() {
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

  const checkInsForMenuItem = checkIns
    .map((checkin) => {
      const rating = checkin.ratings.find((x) => x.menuItemId === menuItemId)
      if (rating == null) {
        return null
      }
      const c = {
        ...checkin,
        rating: rating.rating,
      }
      return c
    })
    .filter(notUndefined)

  const checkinCountsByMenuItem =
    calculateCheckinCountsByMenuItem(checkIns)[menuItemId]

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
      <VStack style={{ marginTop: 0 }} alignItems="start">
        <Heading alignSelf={"start"} as="h1" size="lg">
          {menuItem.name}
        </Heading>
        <HStack>
          <Upvote count={checkinCountsByMenuItem?.positive ?? 0} />
          <Downvote count={checkinCountsByMenuItem?.positive ?? 0} />
        </HStack>
      </VStack>

      <Text fontWeight={500}>Check-Ins</Text>
      {checkInsForMenuItem.length === 0 && (
        <EmptyStateText>No Check-Ins for menu item.</EmptyStateText>
      )}
      {checkInsForMenuItem.map((m) => (
        <HStack
          key={m.id}
          width="100%"
          as={Link}
          to={`/place/${place.id}/check-in/${m.id}`}
        >
          <Card size="sm" w="full">
            <CardBody>
              <HStack w="full">
                <HStack>
                  <VStack align="start">
                    <Text fontWeight={"bold"}>
                      <UserIdToName userId={m.createdById} />
                    </Text>
                    <div>{formatHumanDate(m.createdAt)}</div>
                  </VStack>
                </HStack>
                <Spacer />
                <Box padding="4">
                  {m.rating > 0 ? <Upvote /> : <Downvote />}
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </HStack>
      ))}
    </Page>
  )
}
