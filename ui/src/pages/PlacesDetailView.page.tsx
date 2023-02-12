import {
  Button,
  ButtonGroup,
  Divider,
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
import { Link, useHistory, useLocation, useParams } from "react-router-dom"
import { useThrottledCallback } from "use-debounce"

import { CheckInRating, PlaceMenuItem } from "../api-schemas"
import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { CheckInCommentCard } from "../components/CheckInCommentCard"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { PlaceInfoPanel } from "../components/PlaceInfoPanel"
import { Downvote, Upvote } from "../components/Ratings"
import { useCheckins, useMenuItems, usePlace, useUser } from "../hooks"
import {
  pathCheckinCreate,
  pathCheckinDetail,
  pathMenuItemDetail,
  pathPlaceEdit,
} from "../paths"

function tabToIndex(tab: string | null): number {
  if (tab === "checkins") {
    return 1
  }
  return 0
}

function indexToTab(index: number) {
  if (index === 1) {
    return "checkins"
  }
  return null
}

const TAB_URL_PARAM = "tab"

export function PlacesDetailView() {
  const { placeId }: { placeId: string } = useParams()
  const search = useLocation().search
  const searchParams = new URLSearchParams(search)
  const tabIndex = tabToIndex(searchParams.get(TAB_URL_PARAM))

  const history = useHistory()

  const place = usePlace(placeId)
  const menuitems = useMenuItems(placeId)
  const checkins = useCheckins(placeId)
  const user = useUser()

  // Hack to work around Chakra calling the onChange callback twice
  const handleTabChange = useThrottledCallback(
    (index: number) => {
      const updatedParams = new URLSearchParams(searchParams)
      const paramValue = indexToTab(index)
      if (paramValue == null) {
        updatedParams.delete(TAB_URL_PARAM)
      } else {
        updatedParams.set(TAB_URL_PARAM, paramValue)
      }
      const newSearch = updatedParams.toString()
      history.push({ search: newSearch })
    },
    200,
    { leading: true, trailing: false },
  )

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

  function ratingForUser(m: PlaceMenuItem) {
    if (checkins === "loading") {
      return null
    }

    const checkinRatings: {
      rating: CheckInRating
      createdAt: Timestamp | null
    }[] = []
    for (const checkin of checkins) {
      for (const rating of checkin.ratings) {
        if (rating.menuItemId === m.id) {
          checkinRatings.push({ rating, createdAt: checkin.checkedInAt })
        }
      }
    }

    const latestCheckin = first(
      orderBy(checkinRatings, (x) => x.createdAt?.toMillis() ?? 0, ["desc"]),
    )
    return latestCheckin?.rating.rating ?? 0
  }

  const countsByMenuItem = calculateCheckinCountsByMenuItem(checkins)

  return (
    <Page>
      <HStack w="100%" alignItems={"stretch"}>
        <PlaceInfoPanel place={place} />
        <Spacer />
        <VStack alignItems={"start"}>
          <Link to={pathPlaceEdit({ placeId })}>
            <Button size="sm" variant={"outline"}>
              Edit
            </Button>
          </Link>
        </VStack>
      </HStack>
      <Link style={{ width: "100%" }} to={pathCheckinCreate({ placeId })}>
        <Button width="100%">Add a Check-In</Button>
      </Link>
      <Tabs width="100%" index={tabIndex} onChange={handleTabChange}>
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
              <VStack
                key={m.id}
                w="full"
                as={Link}
                to={pathMenuItemDetail({ placeId, menuItemId: m.id })}
              >
                <HStack w="full">
                  <Text fontSize={"lg"}>{m.name}</Text>
                  <Spacer />
                  <ButtonGroup>
                    <Upvote
                      count={countsByMenuItem[m.id]?.positive}
                      showColor={(ratingForUser(m) ?? 0) > 0}
                    />
                    <Downvote
                      count={countsByMenuItem[m.id]?.negative}
                      showColor={(ratingForUser(m) ?? 0) < 0}
                    />
                  </ButtonGroup>
                </HStack>
                <Divider />
              </VStack>
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
                to={pathCheckinDetail({ placeId, checkInId: c.id })}
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
