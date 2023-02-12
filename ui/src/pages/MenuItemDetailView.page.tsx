import {
  Box,
  Button,
  Divider,
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
import { pathCheckinDetail, pathMenuItemEdit, pathPlaceDetail } from "../paths"
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
        rating,
      }
      return c
    })
    .filter(notUndefined)

  const checkinCountsByMenuItem =
    calculateCheckinCountsByMenuItem(checkIns)[menuItemId]

  return (
    <Page>
      <VStack alignItems="start" spacing={2} w="full">
        <HStack w="full">
          <VStack alignItems="start" spacing={0}>
            <HStack>
              <Heading alignSelf={"start"} as="h1" size="lg">
                {menuItem.name}
              </Heading>
            </HStack>
            <Text
              as={Link}
              fontSize="md"
              fontWeight={500}
              to={pathPlaceDetail({ placeId })}
            >
              <div>{place.name}</div>
              <div>{place.location}</div>
            </Text>
          </VStack>
          <Spacer />
          <Box alignSelf={"start"}>
            <Link to={pathMenuItemEdit({ menuItemId, placeId })}>
              <Button size="sm" variant={"outline"}>
                Edit
              </Button>
            </Link>
          </Box>
        </HStack>
      </VStack>

      <HStack w="full">
        <Heading as="h2" size="md" marginRight="auto">
          Check-Ins
        </Heading>

        <span>↑ {checkinCountsByMenuItem?.positive ?? 0}</span>
        <span>↓ {checkinCountsByMenuItem?.negative ?? 0}</span>
      </HStack>
      <Divider />
      {checkInsForMenuItem.length === 0 && (
        <EmptyStateText>No Check-Ins for menu item.</EmptyStateText>
      )}
      {checkInsForMenuItem.map((menuItem) => (
        <VStack
          key={menuItem.id}
          width="100%"
          as={Link}
          to={pathCheckinDetail({ checkInId: menuItem.id, placeId })}
        >
          <>
            <>
              <HStack w="full">
                <HStack>
                  <VStack align="start">
                    <Text fontWeight={"bold"}>
                      <UserIdToName userId={menuItem.createdById} />
                    </Text>
                    <div>{formatHumanDate(menuItem.createdAt)}</div>
                  </VStack>
                </HStack>
                <Spacer />
                <Box padding="4">
                  {menuItem.rating.rating > 0 ? <Upvote /> : <Downvote />}
                </Box>
              </HStack>
              {menuItem.rating.comment.length > 0 && (
                <>
                  <Spacer marginY="4" />
                  <Text>{menuItem.rating.comment}</Text>
                </>
              )}
            </>
            <Divider />
          </>
        </VStack>
      ))}
    </Page>
  )
}
