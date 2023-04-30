import {
  AddIcon,
  CheckIcon,
  CloseIcon,
  RepeatIcon,
  WarningIcon,
} from "@chakra-ui/icons"
import {
  Box,
  Heading,
  HStack,
  Select,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { format, formatISO } from "date-fns"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { placeById, userById } from "../api"
import { Activity, PlaceCheckIn } from "../api-schemas"
import { assertCond } from "../assertCond"
import { assertNever } from "../assertNever"
import { Page } from "../components/Page"
import { formatHumanDate, formatHumanDateTime } from "../date"
import { useActivities, useCheckinActivities, useUser } from "../hooks"
import {
  pathCheckinDetail,
  pathMenuItemDetail,
  pathPlaceDetail,
} from "../paths"

type ActivityType = "create" | "delete" | "update" | "merge"

function updateTypeToStr(type: ActivityType): string {
  if (type === "create") {
    return "added"
  }
  if (type === "delete") {
    return "deleted"
  }
  if (type === "update") {
    return "updated"
  }
  if (type === "merge") {
    return "merged"
  }
  assertNever(type)
}

const linkStyled = {
  fontWeight: "500",
  textDecoration: "underline",
}

function updateDescription({
  update,
  placeId,
  activity,
}: {
  update: ActivityType
  placeId: string
  activity: Activity
}) {
  if (activity.document === "checkin") {
    return (
      <>
        {updateTypeToStr(update)} a{" "}
        <Text
          as={Link}
          {...linkStyled}
          to={pathCheckinDetail({ placeId, checkInId: activity.checkinId })}
        >
          checkin
        </Text>{" "}
        at
      </>
    )
  }
  if (activity.document === "menuitem") {
    const menuItemLink = (
      <Text
        as={Link}
        {...linkStyled}
        to={pathMenuItemDetail({
          placeId,
          menuItemId: activity.menuitemId,
        })}
      >
        menu item
      </Text>
    )
    if (update === "create") {
      return (
        <>
          {updateTypeToStr(update)} a {menuItemLink} to
        </>
      )
    }
    return (
      <>
        {updateTypeToStr(update)} a {menuItemLink} at
      </>
    )
  }
  if (activity.document === "place") {
    if (update === "merge") {
      return <>merged a place into</>
    }
    return <>{updateTypeToStr(update)}</>
  }
  return assertNever(activity)
}

function CheckinCreated({ checkin }: { checkin: PlaceCheckInJoined }) {
  return (
    <HStack spacing={1} width="100%" justifyContent={"space-between"}>
      <div>
        <span style={{ fontWeight: "bold" }}>{checkin.createdByName}</span>{" "}
        created a{" "}
        {
          <Text
            as={Link}
            fontWeight={500}
            to={pathCheckinDetail({
              placeId: checkin.placeId,
              checkInId: checkin.id,
            })}
          >
            checkin
          </Text>
        }{" "}
      </div>
      <Box>{format(checkin.createdAt.toDate(), "h:mmaaa")}</Box>
    </HStack>
  )
}

async function getUserNameMapping(
  userIds: Array<string>,
): Promise<Record<string, string>> {
  const results = await Promise.all(
    userIds.map((userId) => userById({ userId })),
  )
  let mapping: Record<string, string> = {}
  results.forEach((element) => {
    mapping[element.uid] = element.displayName || element.email
  })
  return mapping
}

async function getPlaceNameMapping(
  placeIds: Array<string>,
): Promise<Record<string, string>> {
  const results = await Promise.all(
    placeIds.map((placeId) => placeById({ placeId })),
  )
  let mapping: Record<string, string> = {}
  results.forEach((element) => {
    mapping[element.id] = element.name
  })
  return mapping
}

type ActivityJoined = Activity & { createdByName: string; placeName: string }
type PlaceId = string
type DayStr = string

type PlaceCheckInJoined = PlaceCheckIn & {
  createdByName: string
  placeName: string
}
type PlaceCheckinAggregated = Record<
  DayStr,
  Record<PlaceId, { activities: PlaceCheckInJoined[]; placeName: string }>
>

async function convertCheckins(
  orderedCheckins: PlaceCheckIn[],
): Promise<PlaceCheckinAggregated> {
  let dayToCheckins: Record<DayStr, PlaceCheckInJoined[]> = {}
  let createdByIds = new Set<string>()
  let placeIds = new Set<string>()
  orderedCheckins.forEach((checkin) => {
    if (checkin.checkedInAt == null) {
      return
    }
    let key = formatISO(checkin.checkedInAt.toDate(), {
      representation: "date",
    })
    if (dayToCheckins[key] == null) {
      dayToCheckins[key] = []
    }
    dayToCheckins[key].push({ ...checkin, createdByName: "", placeName: "" })

    createdByIds.add(checkin.createdById)
    placeIds.add(checkin.placeId)
  })

  let dayToPlaceCheckins: PlaceCheckinAggregated = {}

  Object.entries(dayToCheckins).forEach(([day, value]) => {
    value.forEach((checkin) => {
      if (dayToPlaceCheckins[day] == null) {
        dayToPlaceCheckins[day] = {}
      }
      if (dayToPlaceCheckins[day][checkin.placeId] == null) {
        dayToPlaceCheckins[day][checkin.placeId] = {
          placeName: "",
          activities: [],
        }
      }
      dayToPlaceCheckins[day][checkin.placeId].activities.push(checkin)
    })
  })

  const [userNameMapping, placeNameMapping] = await Promise.all([
    getUserNameMapping([...createdByIds]),
    getPlaceNameMapping([...placeIds]),
  ])

  Object.values(dayToPlaceCheckins).forEach((placeIdToActivities) => {
    Object.values(placeIdToActivities).forEach((place) => {
      place.activities.forEach((activity) => {
        activity.createdByName = userNameMapping[activity.createdById]
        activity.placeName = placeNameMapping[activity.placeId]
        place.placeName = placeNameMapping[activity.placeId]
      })
    })
  })

  return dayToPlaceCheckins
}

async function joinActivitiesToNames(
  orderedActivities: Activity[],
): Promise<ActivityJoined[]> {
  // do a join so we don't have denormalize a million things
  let createdByIds = new Set<string>()
  let placeIds = new Set<string>()
  orderedActivities.forEach((activity) => {
    createdByIds.add(activity.createdById)
    placeIds.add(activity.placeId)
  })

  const [userNameMapping, placeNameMapping] = await Promise.all([
    getUserNameMapping([...createdByIds]),
    getPlaceNameMapping([...placeIds]),
  ])

  return orderedActivities.map((a): ActivityJoined => {
    const placeName = placeNameMapping[a.placeId]
    const createdByName = userNameMapping[a.createdById]
    return { ...a, placeName, createdByName }
  })
}

function PlaceName({
  placeId,
  placeName,
}: {
  placeId: string
  placeName: string
}) {
  return (
    <Text as={Link} fontWeight={500} to={pathPlaceDetail({ placeId })}>
      {placeName}
    </Text>
  )
}

function useActivitiesMapping({ userId }: { userId: string }) {
  // NOTE: this doesn't handle caching.
  //
  // When we unmount and then mount we should show the most recent data we have,
  // instead we end up in a loading state.
  //
  // onSnapshot will retrieve data from the cache on mount but we then have to
  // join that to other data which isn't in the cache.
  //
  // Ideally Firebase would support some sort of join / expansion mechanism and
  // handle all the caching internally, but I think we'll have to roll our own
  // to support this.
  const [state, setState] = useState<
    PlaceCheckinAggregated | "loading" | "error"
  >("loading")
  const checkins = useCheckinActivities({ userId })

  useEffect(() => {
    let cancel = false
    if (checkins === "error" || checkins === "loading") {
      return
    }
    convertCheckins(checkins)
      .then((res) => {
        if (cancel) {
          return
        }
        setState(res)
      })
      .catch(() => {
        setState("error")
      })

    return () => {
      cancel = true
    }
  }, [checkins])

  return state
}

function Profile({ children }: { children: React.ReactNode }) {
  const size = 32
  return (
    <Box
      style={{
        height: size,
        minHeight: size,
        minWidth: size,
        width: size,
        borderWidth: "1px",
        border: "1px solid gray",
        color: "inherit",
        borderRadius: "100%",
        justifyContent: "center",
        display: "flex",
        fontWeight: "bold",
        alignItems: "center",
      }}
    >
      {children}
    </Box>
  )
}

function ActionIcon({
  type,
  document,
}: {
  type: "create" | "delete" | "update" | "merge"
  document: Activity["document"]
}) {
  // TODO: better icons
  if (type === "create") {
    if (document === "checkin") {
      return (
        <Profile>
          <CheckIcon color="green.400" />
        </Profile>
      )
    }
    return (
      <Profile>
        <AddIcon color="green.400" />
      </Profile>
    )
  }
  return (
    <Profile>
      {type === "delete" ? (
        <CloseIcon boxSize={3} color="red.400" />
      ) : type === "update" ? (
        <RepeatIcon color="blue.400" />
      ) : type === "merge" ? (
        <WarningIcon color="yellow.400" />
      ) : (
        assertNever(type)
      )}
    </Profile>
  )
}

function Action({
  update,
  placeId,
  activity,
}: {
  update: ActivityType
  placeId: string
  activity: ActivityJoined
}) {
  const description = updateDescription({
    update,
    placeId,
    activity,
  })
  return (
    <>
      {description}{" "}
      <Text as={Link} {...linkStyled} to={pathPlaceDetail({ placeId })}>
        {activity.placeName}
      </Text>
    </>
  )
}

function ActivityDescription({
  update,
  placeId,
  activity,
}: {
  placeId: string
  update: ActivityType
  activity: ActivityJoined
}) {
  return (
    <HStack spacing={1}>
      <div>
        <span style={{ fontWeight: "bold" }}>{activity.createdByName}</span>{" "}
        <Action update={update} placeId={placeId} activity={activity} />
      </div>
    </HStack>
  )
}

function ActivityTimestamp({
  timestamp,
}: {
  timestamp: Activity["createdAt"]
}) {
  return <div>{formatHumanDateTime(timestamp)}</div>
}

function AnyActivity({
  document,
  type,
  timestamp,
  activity,
}: {
  document: Activity["document"]
  type: ActivityType
  timestamp: Activity["createdAt"]
  activity: ActivityJoined
}) {
  return (
    <HStack spacing={3}>
      <ActionIcon type={type} document={document} />

      <VStack align="start" spacing={0}>
        <ActivityDescription
          update={type}
          placeId={activity.placeId}
          activity={activity}
        />
        <ActivityTimestamp timestamp={timestamp} />
      </VStack>
    </HStack>
  )
}

function useAllActivities({ userId }: { userId: string }) {
  const [state, setState] = useState<ActivityJoined[] | "loading" | "error">(
    "loading",
  )
  const activities = useActivities({ userId })

  useEffect(() => {
    let cancel = false
    if (activities === "error" || activities === "loading") {
      return
    }
    joinActivitiesToNames(activities)
      .then((res) => {
        if (cancel) {
          return
        }
        setState(res)
      })
      .catch(() => {
        setState("error")
      })

    return () => {
      cancel = true
    }
  }, [activities])

  return state
}

function AllActivities({ userId }: { userId: string }) {
  const activities = useAllActivities({ userId })
  return (
    <VStack spacing={4} align="start">
      {activities === "error" ? (
        <div>error</div>
      ) : activities === "loading" ? (
        <div>loading...</div>
      ) : (
        activities.map((a) => {
          return (
            <AnyActivity
              key={a.id}
              document={a.document}
              type={a.type}
              timestamp={a.createdAt}
              activity={a}
            />
          )
        })
      )}
    </VStack>
  )
}

function CheckinActivities({ userId }: { userId: string }) {
  const checkins = useActivitiesMapping({
    userId,
  })
  return (
    <VStack spacing={6} align="start" width="100%">
      {checkins === "error" ? (
        <div>Error</div>
      ) : checkins === "loading" ? (
        <div>Loading...</div>
      ) : (
        Object.entries(checkins).map(([day, placesWithCheckins]) => (
          <Box key={day} width={"100%"}>
            <Box borderBottomWidth={"1px"} marginBottom={2}>
              {formatHumanDate(new Date(day))}
            </Box>
            <VStack spacing={3} width="100%" alignItems={"start"}>
              {Object.entries(placesWithCheckins).map(
                ([placeId, { activities: checkins, placeName }]) => (
                  <Box key={placeId} w="100%">
                    <Box>
                      <PlaceName placeId={placeId} placeName={placeName} />
                    </Box>
                    {checkins.map((c) => {
                      return <CheckinCreated key={c.id} checkin={c} />
                    })}
                  </Box>
                ),
              )}
            </VStack>
          </Box>
        ))
      )}
    </VStack>
  )
}

export function ActivityView() {
  type SelectOption = "everything" | "checkins"
  const [filter, setFilter] = useState<SelectOption>("checkins")
  const user = useUser()
  const userId = user.data?.uid ?? ""

  return (
    <Page>
      <HStack w="100%" alignItems={"center"}>
        <Heading as="h1" size="lg">
          Activity
        </Heading>
        <Spacer />
      </HStack>
      <HStack>
        <Text minWidth={"max-content"}>Show</Text>
        <Select
          size="sm"
          value={filter}
          onChange={(e) => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            setFilter(e.target.value as SelectOption)
          }}
        >
          {" "}
          <option value="checkins">Checkins</option>
          <option value="everything">Everything</option>
        </Select>
      </HStack>

      {filter === "checkins" ? (
        <CheckinActivities userId={userId} />
      ) : (
        <AllActivities userId={userId} />
      )}
    </Page>
  )
}
