import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Input,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { Timestamp } from "firebase/firestore"
import first from "lodash-es/first"
import orderBy from "lodash-es/orderBy"
import { useEffect, useState } from "react"
import { Link, useHistory, useLocation, useParams } from "react-router-dom"
import { useThrottledCallback } from "use-debounce"

import * as api from "../api"
import { CheckInRating, PlaceMenuItem } from "../api-schemas"
import { calculateCheckinCountsByMenuItem } from "../api-transforms"
import { CheckInCommentCard } from "../components/CheckInCommentCard"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { ErrorStateText } from "../components/ErrorStateText"
import { GoogleMapsJSMap } from "../components/GoogleMapsJSMap"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { formatHumanDateTime } from "../date"
import { useCheckins, useMenuItems, usePlace, useUser } from "../hooks"
import {
  pathCheckinCreate,
  pathCheckinDetail,
  pathMenuItemDetail,
  pathPlaceEdit,
} from "../paths"
import { startCase } from "../textutils"
import { UserIdToName } from "./FriendsListView.page"

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

function SkippableBanner({
  isSkippableAt,
  isSkippableById,
}: {
  isSkippableAt: Timestamp
  isSkippableById: string | null
}) {
  // This isn't great, ideally it would come with the query (joins!)
  const actorName = isSkippableById ? (
    <UserIdToName userId={isSkippableById} />
  ) : (
    ""
  )
  const markedAt =
    isSkippableAt != null ? formatHumanDateTime(isSkippableAt) : null
  return (
    <Alert status="warning" variant="subtle" display={"flex"} padding={4}>
      <HStack>
        <AlertIcon boxSize="40px" />
        <VStack alignItems={"start"}>
          <AlertTitle fontSize="lg">Skippable</AlertTitle>
          <AlertDescription marginTop="0">
            {actorName} marked this as skippable {markedAt}
          </AlertDescription>
        </VStack>
      </HStack>
    </Alert>
  )
}

export function PlacesDetailView() {
  const { placeId }: { placeId: string } = useParams()
  const search = useLocation().search
  const searchParams = new URLSearchParams(search)
  const tabIndex = tabToIndex(searchParams.get(TAB_URL_PARAM))
  const [localUserRatings, setLocalUserRatings] = useState<
    Record<string, 1 | -1 | undefined>
  >({})

  const history = useHistory()

  const place = usePlace(placeId)
  const menuitems = useMenuItems(placeId)
  const checkins = useCheckins(placeId)
  const user = useUser()
  const toast = useToast()

  // HACK(chris): we clean up this state when our checkins update for any reason.
  useEffect(() => {
    setLocalUserRatings({})
  }, [checkins])

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

  if (place === "error" || menuitems === "error" || checkins === "error") {
    return (
      <Page>
        <ErrorStateText>
          Problem loading place with id: {placeId}
        </ErrorStateText>
      </Page>
    )
  }

  function ratingForUser(m: PlaceMenuItem, userId: string) {
    if (checkins === "loading" || checkins === "error") {
      return null
    }

    const checkinRatings: {
      rating: CheckInRating
      createdAt: Timestamp | null
    }[] = []
    for (const checkin of checkins) {
      if (checkin.createdById !== userId) {
        continue
      }
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

  const quickCheckin = (menuItemId: string, rating: 1 | -1) => {
    setLocalUserRatings((s) => ({ ...s, [menuItemId]: rating }))
    api.checkin
      .createQuickCheckin({
        placeId,
        userId: user.data.uid,
        viewerIds: place.viewerIds,
        review: { menuItemId, rating },
      })
      .catch((e: FirebaseError) => {
        if (!(e instanceof FirebaseError)) {
          throw e
        }
        toast({
          title: "Problem creating checkin",
          description: `${e.code}: ${e.message}`,
          status: "error",
        })
      })
  }

  return (
    <Page title={place.name}>
      {place.isSkippableAt != null ? (
        <SkippableBanner
          isSkippableAt={place.isSkippableAt}
          isSkippableById={place.isSkippableById}
        />
      ) : null}
      <HStack w="100%" alignItems={"stretch"}>
        <div>
          <Heading as="h1" size="lg">
            {place.name}
          </Heading>
          <Text fontWeight={"bold"}>{place.location}</Text>
        </div>
        <Spacer />
        <VStack alignItems={"start"}>
          <Link to={pathPlaceEdit({ placeId })}>
            <Button size="sm" variant={"outline"}>
              Edit
            </Button>
          </Link>
        </VStack>
      </HStack>

      {place.geoInfo != null && (
        <GoogleMapsJSMap
          markerLocation={place.location}
          geoInfo={place.geoInfo}
          variant="gray"
        />
      )}
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
            <CreateMenuItem placeId={placeId} userId={user.data.uid} />
            <Spacer />
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
                  <Text fontSize={"lg"}>{startCase(m.name)}</Text>
                  <Spacer />
                  <ButtonGroup>
                    <Upvote
                      onClick={(e) => {
                        e.preventDefault()
                        quickCheckin(m.id, 1)
                      }}
                      count={countsByMenuItem[m.id]?.positive}
                      showColor={
                        (localUserRatings[m.id] ??
                          ratingForUser(m, user.data.uid) ??
                          0) > 0
                      }
                    />
                    <Downvote
                      onClick={(e) => {
                        e.preventDefault()
                        quickCheckin(m.id, -1)
                      }}
                      count={countsByMenuItem[m.id]?.negative}
                      showColor={
                        (localUserRatings[m.id] ??
                          ratingForUser(m, user.data.uid) ??
                          0) < 0
                      }
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

function CreateMenuItem({
  placeId,
  userId,
}: {
  placeId: string
  userId: string
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [menuItem, setMenuItem] = useState("")
  const toast = useToast()
  const createMenuItem = async () => {
    try {
      await api.menuItems.create({
        placeId,
        name: menuItem.trim(),
        userId,
      })
      setMenuItem("")
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        toast({
          title: "Problem creating menu item",
          description: `${e.code}: ${e.message}`,
          status: "error",
        })
      } else {
        throw e
      }
    } finally {
      setIsCreating(false)
    }
  }
  return (
    <HStack
      w="100%"
      as="form"
      onSubmit={(e) => {
        e.preventDefault()
        void createMenuItem()
      }}
    >
      <Input
        placeholder="Add new menu item..."
        type="text"
        value={menuItem}
        onChange={(e) => {
          setMenuItem(e.target.value)
        }}
      />
      <Button type="submit" loadingText={"Saving..."} isLoading={isCreating}>
        Add
      </Button>
    </HStack>
  )
}
