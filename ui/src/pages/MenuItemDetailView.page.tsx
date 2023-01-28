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
import { pathCheckinDetail, pathPlaceDetail } from "../paths"
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
      <VStack alignItems="start" spacing={2}>
        <VStack alignItems="start" spacing={0}>
          <Text
            as={Link}
            to={pathPlaceDetail({ placeId })}
            fontSize="md"
            fontWeight={500}
          >
            {place.name}
          </Text>
          <Heading alignSelf={"start"} as="h1" size="lg">
            {menuItem.name}
          </Heading>
        </VStack>
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
          to={pathCheckinDetail({ checkInId: m.id, placeId })}
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
