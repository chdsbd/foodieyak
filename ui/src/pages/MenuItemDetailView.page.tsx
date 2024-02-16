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
import { sortBy } from "lodash-es"
import { Link, useParams } from "react-router-dom"

import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { ErrorStateText } from "../components/ErrorStateText"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { formatHumanDate } from "../date"
import { useCheckins, useMenuItem, usePlace, useUser } from "../hooks"
import { pathMenuItemEdit, pathPlaceDetail } from "../paths"
import { startCase } from "../textutils"
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

  if (
    currentUser.data == null ||
    place === "error" ||
    menuItem === "error" ||
    checkIns === "error"
  ) {
    return (
      <Page>
        <ErrorStateText>
          Problem loading place with id: {placeId}
        </ErrorStateText>
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
          </Heading>

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

      <HStack w="full" marginLeft={"auto"}>
        <Heading as="h2" size="md" marginRight="auto">
          {startCase(menuItem.name)}
        </Heading>

        <span>↑ {checkinCountsByMenuItem?.positive ?? 0}</span>
        <span>↓ {checkinCountsByMenuItem?.negative ?? 0}</span>
      </HStack>
      <Divider />
      {checkInsForMenuItem.length === 0 && (
        <EmptyStateText>No Check-Ins for menu item.</EmptyStateText>
      )}
      {sortBy(checkInsForMenuItem, (x) => x.checkedInAt?.toDate().toISOString())
        .reverse()
        .map((menuItem) => (
          <VStack key={menuItem.id} width="100%" alignItems={"start"}>
            <HStack w="full" alignItems={"start"}>
              <Box w="full" alignItems={"start"}>
                <Text fontWeight={"bold"}>
                  <UserIdToName userId={menuItem.createdById} />
                </Text>
                {/* TODO: we want to link to the checkin here, but we don't have access to the checkin id */}
                {menuItem.rating.comment.length > 0 && (
                  <Text paddingRight={"4"} marginTop={0}>
                    {menuItem.rating.comment}
                  </Text>
                )}
              </Box>
              <VStack alignItems={"end"}>
                {menuItem.checkedInAt != null ? (
                  <Text whiteSpace={"pre"}>
                    {formatHumanDate(menuItem.checkedInAt)}
                  </Text>
                ) : (
                  <div>{"\u00A0"}</div>
                )}

                <Box>
                  {menuItem.rating.rating > 0 ? <Upvote /> : <Downvote />}
                </Box>
              </VStack>
            </HStack>

            {/* <Divider /> */}
          </VStack>
        ))}
    </Page>
  )
}
