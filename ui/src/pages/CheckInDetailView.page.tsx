import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spacer,
  Text,
} from "@chakra-ui/react"
import { ThumbsDown, ThumbsUp } from "react-feather"
import { Link, useParams } from "react-router-dom"

import { PlaceMenuItem } from "../api-schemas"
import { CheckInCommentCard } from "../components/CheckInCommentCard"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { PlaceInfoPanel } from "../components/PlaceInfoPanel"
import { formatHumanDate, formatHumanDateTime } from "../date"
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
            Check-In — {formatHumanDate(checkIn.createdAt)}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading as="h1" size="lg" alignSelf={"start"}>
        Check-In
      </Heading>

      {/* <Heading as="h2" size="md">
        Created
      </Heading>
      <Text alignSelf={"start"}>
        {formatHumanDateTime(checkIn.createdAt)} by{" "}
        <UserIdToName userId={checkIn.createdById} />
      </Text>
      <Heading as="h2" size="md">
        Comment
      </Heading>
      <Text alignSelf={"start"}>{checkIn.comment}</Text> */}
      <CheckInCommentCard checkIn={checkIn} />

      <Heading as="h2" size="md" alignSelf={"start"}>
        Menu Items
      </Heading>
      {checkIn.ratings.length === 0 && (
        <EmptyStateText>No Ratings</EmptyStateText>
      )}
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
