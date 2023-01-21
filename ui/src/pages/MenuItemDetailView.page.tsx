import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Spacer,
  VStack,
} from "@chakra-ui/react"
import { ThumbsDown, ThumbsUp } from "react-feather"
import { Link, useParams } from "react-router-dom"

import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { DelayedLoader } from "../components/DelayedLoader"
import { LocationImage } from "../components/LocationImage"
import { Page } from "../components/Page"
import { PlaceInfoPanel } from "../components/PlaceInfoPanel"
import { formatHumanDate } from "../date"
import { useCheckins, useMenuItem, usePlace, useUser } from "../hooks"
import { notUndefined } from "../type-guards"
import { NoMatch } from "./NoMatchView.page"

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
  if (place === "not_found" || menuItem === "not_found") {
    return <NoMatch />
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
      <PlaceInfoPanel place={place} />

      <HStack width="100%">
        <Heading alignSelf={"start"} fontSize="2xl">
          {menuItem.name}
        </Heading>
        <Spacer />
        <ButtonGroup>
          <Button>↑{checkinCountsByMenuItem?.positive ?? ""}</Button>
          <Button>↓{checkinCountsByMenuItem?.negative ?? ""}</Button>
        </ButtonGroup>
      </HStack>

      {checkInsForMenuItem.map((m) => (
        <HStack
          key={m.id}
          width="100%"
          as={Link}
          to={`/place/${place.id}/check-in/${m.id}`}
        >
          <HStack>
            <VStack align="start">
              <div>{m.createdById}</div>
              <div>{formatHumanDate(m.createdAt)}</div>
            </VStack>
          </HStack>
          <Spacer />
          <ButtonGroup>
            <Button>
              <ThumbsUp fill={m.rating > 0 ? "lightgreen" : "transparent"} />
            </Button>
            <Button>
              <ThumbsDown fill={m.rating < 0 ? "orange" : "transparent"} />
            </Button>
          </ButtonGroup>
        </HStack>
      ))}
    </Page>
  )
}
