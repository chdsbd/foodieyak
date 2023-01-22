import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Timestamp } from "firebase/firestore"
import first from "lodash-es/first"
import orderBy from "lodash-es/orderBy"
import { Link, useParams } from "react-router-dom"

import { CheckInRating, PlaceCheckIn, PlaceMenuItem } from "../api-schemas"
import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { CheckInCommentCard } from "../components/CheckInCommentCard"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { PlaceInfoPanel } from "../components/PlaceInfoPanel"
import { formatHumanDateTime } from "../date"
import { useCheckins, useMenuItems, usePlace, useUser } from "../hooks"
import { UserIdToName } from "./FriendsListView.page"

export function PlacesDetailView() {
  const { placeId }: { placeId: string } = useParams()
  const place = usePlace(placeId)
  const menuitems = useMenuItems(placeId)
  const checkins = useCheckins(placeId)
  const user = useUser()
  if (
    user.data == null ||
    place === "loading" ||
    menuitems === "loading" ||
    checkins === "loading"
  ) {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  function ratingForUser(m: PlaceMenuItem): -1 | 0 | 1 {
    if (checkins === "loading") {
      return 0
    }

    const checkinRatings: { rating: CheckInRating; createdAt: Timestamp }[] = []
    for (const checkin of checkins) {
      for (const rating of checkin.ratings) {
        if (rating.menuItemId === m.id) {
          checkinRatings.push({ rating, createdAt: checkin.createdAt })
        }
      }
    }

    const latestCheckin = first(
      orderBy(checkinRatings, (x) => x.createdAt, ["desc"]),
    )
    return latestCheckin?.rating.rating ?? 0
  }

  const countsByMenuItem = calculateCheckinCountsByMenuItem(checkins)

  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to={`/place/${place.id}`}>
            {place.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <HStack w="100%" alignItems={"stretch"}>
        <PlaceInfoPanel place={place} />
        <Spacer />
        <VStack alignItems={"start"}>
          <Link to={`/place/${placeId}/edit`}>
            <Button size="sm" variant={"outline"}>
              Edit
            </Button>
          </Link>
        </VStack>
      </HStack>
      <Link style={{ width: "100%" }} to={`/place/${place.id}/check-in`}>
        <Button width="100%">Add a Check-In</Button>
      </Link>
      <Tabs width="100%">
        <TabList>
          <Tab>Menu</Tab>
          <Tab>Check-Ins</Tab>
        </TabList>

        <TabPanels>
          <TabPanel
            paddingX="unset"
            as={VStack}
            justifyContent="space-between"
            w="full"
          >
            {menuitems.length === 0 && (
              <EmptyStateText>No Menu Items</EmptyStateText>
            )}
            {menuitems.map((m) => (
              <HStack
                key={m.id}
                w="full"
                as={Link}
                to={`/place/${place.id}/menu/${m.id}`}
              >
                <Card w="full" size="sm">
                  <HStack as={CardBody} w="full">
                    <Text fontSize={"lg"}>{m.name}</Text>
                    <Spacer />
                    <ButtonGroup>
                      <Button
                        colorScheme={
                          (ratingForUser(m) ?? 0) > 0 ? "green" : undefined
                        }
                      >
                        ↑{countsByMenuItem[m.id]?.positive}
                      </Button>
                      <Button
                        colorScheme={
                          (ratingForUser(m) ?? 0) < 0 ? "red" : undefined
                        }
                      >
                        ↓{countsByMenuItem[m.id]?.negative}
                      </Button>
                    </ButtonGroup>
                  </HStack>
                </Card>
              </HStack>
            ))}
          </TabPanel>
          <TabPanel
            paddingX="unset"
            as={VStack}
            justifyContent="space-between"
            w="full"
          >
            {checkins.length === 0 && (
              <EmptyStateText>No Check-Ins</EmptyStateText>
            )}
            {checkins.map((c) => (
              <HStack
                key={c.id}
                w="full"
                as={Link}
                to={`/place/${place.id}/check-in/${c.id}`}
              >
                <CheckInCommentCard checkIn={c} />
              </HStack>
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Page>
  )
}
