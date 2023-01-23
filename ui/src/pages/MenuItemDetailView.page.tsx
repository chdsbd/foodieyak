import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Card,
  CardBody,
  Heading,
  HStack,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { ThumbsDown, ThumbsUp } from "react-feather"
import { Link, useParams } from "react-router-dom"

import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
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

  const countDifference =
    (checkinCountsByMenuItem?.positive ?? 0) -
    (checkinCountsByMenuItem?.negative ?? 0)

  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to={`/place/${place.id}`}>
            Tenoch
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            as={Link}
            to={`/place/${place.id}/menu/${menuItem.id}`}
          >
            {menuItem.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading alignSelf={"start"} as="h1" size="lg">
        Menu Item
      </Heading>

      <Text fontSize="xl">{menuItem.name}</Text>

      <Heading as="h2" size="md">
        Ratings
      </Heading>
      <HStack>
        <Card size="sm">
          <CardBody>
            <HStack>
              <ThumbsUp fill={"lightgreen"} />
              <Text fontWeight="bold">
                {checkinCountsByMenuItem?.positive ?? 0}
              </Text>
            </HStack>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardBody>
            <HStack>
              <ThumbsDown fill={"orange"} />
              <Text fontWeight="bold">
                {checkinCountsByMenuItem?.negative ?? 0}
              </Text>
            </HStack>
          </CardBody>
        </Card>
      </HStack>
      <Heading as="h2" size="md">
        Related Check-Ins
      </Heading>
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
                  {m.rating > 0 ? (
                    <ThumbsUp fill={"lightgreen"} />
                  ) : (
                    <ThumbsDown fill={"orange"} />
                  )}
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </HStack>
      ))}
    </Page>
  )
}
