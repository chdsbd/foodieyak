import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Heading,
  HStack,
  Spacer,
  Text,
} from "@chakra-ui/react"
import { ThumbsDown, ThumbsUp } from "react-feather"
import { Link, useParams } from "react-router-dom"

import { PlaceMenuItem } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { LocationImage } from "../components/LocationImage"
import { Page } from "../components/Page"
import { PlaceInfoPanel } from "../components/PlaceInfoPanel"
import { formatHumanDate } from "../date"
import { useCheckIn, useMenuItems, usePlace } from "../hooks"
import { NoMatch } from "./NoMatchView.page"

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
  if (place === "not_found" || checkIn === "not_found") {
    return <NoMatch />
  }

  const menuItemMap = menuItems.reduce<
    Record<PlaceMenuItem["id"], PlaceMenuItem | undefined>
  >((acc, val) => {
    acc[val.id] = val
    return acc
  }, {})

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
            to={`/place/${place.id}/check-in/${checkIn.id}`}
          >
            {formatHumanDate(checkIn.createdAt)}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <PlaceInfoPanel place={place} />

      <Text alignSelf={"start"}>{formatHumanDate(checkIn.createdAt)}</Text>

      <Heading as="h2" size="md" alignSelf={"start"}>
        Menu Items
      </Heading>
      {checkIn.ratings.map((m) => (
        <HStack key={m.menuItemId} width="100%">
          <div>{menuItemMap[m.menuItemId]?.name}</div>
          <Spacer />

          {m.rating > 0 ? (
            <ThumbsUp fill="lightgreen" />
          ) : (
            <ThumbsDown fill="orange" />
          )}
        </HStack>
      ))}

      <Link to={`/place/${place.id}/check-in/${checkIn.id}/edit`}>
        <Button width="100%">Modify Check-In</Button>
      </Link>
    </Page>
  )
}
