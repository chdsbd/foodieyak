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
import { Activity } from "../api-schemas"
import { assertNever } from "../assertNever"
import { Page } from "../components/Page"
import { formatHumanDate } from "../date"
import { useActivities, useUser } from "../hooks"
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
    if (update === "create") {
      return (
        <>
          created a{" "}
          <Text
            as={Link}
            {...linkStyled}
            to={pathCheckinDetail({ placeId, checkInId: activity.checkinId })}
          >
            checkin
          </Text>{" "}
        </>
      )
    }
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

function Activity({
  type,
  activity,
}: {
  type: ActivityType
  activity: ActivityJoined
}) {
  const description = updateDescription({
    update: type,
    placeId: activity.placeId,
    activity,
  })
  return (
    <HStack spacing={1} width="100%" justifyContent={"space-between"}>
      <div>
        <span style={{ fontWeight: "bold" }}>{activity.createdByName}</span>{" "}
        {description}{" "}
      </div>
      <Box>{format(activity.createdAt.toDate(), "h:mmaaa")}</Box>
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

type ActivitiesAggregated = Record<
  DayStr,
  Record<PlaceId, { activities: ActivityJoined[]; placeName: string }>
>

async function convertActivities(
  orderedActivities: Activity[],
): Promise<ActivitiesAggregated> {
  let dayToActivities: Record<DayStr, ActivityJoined[]> = {}
  let createdByIds = new Set<string>()
  let placeIds = new Set<string>()
  orderedActivities.forEach((activity) => {
    let key = formatISO(activity.createdAt.toDate(), {
      representation: "date",
    })
    if (dayToActivities[key] == null) {
      dayToActivities[key] = []
    }
    dayToActivities[key].push({ ...activity, createdByName: "", placeName: "" })

    createdByIds.add(activity.createdById)
    placeIds.add(activity.placeId)
  })

  let dayToPlaceToActivities: ActivitiesAggregated = {}

  Object.entries(dayToActivities).forEach(([day, value]) => {
    value.forEach((activity) => {
      if (dayToPlaceToActivities?.[day]?.[activity.placeId] == null) {
        dayToPlaceToActivities[day] = {}
        dayToPlaceToActivities[day][activity.placeId] = {
          placeName: "",
          activities: [],
        }
      }
      dayToPlaceToActivities[day][activity.placeId].activities.push(activity)
    })
  })

  const [userNameMapping, placeNameMapping] = await Promise.all([
    getUserNameMapping([...createdByIds]),
    getPlaceNameMapping([...placeIds]),
  ])

  Object.values(dayToPlaceToActivities).forEach((placeIdToActivities) => {
    Object.values(placeIdToActivities).forEach((place) => {
      place.activities.forEach((activity) => {
        activity.createdByName = userNameMapping[activity.createdById]
        activity.placeName = placeNameMapping[activity.placeId]
        place.placeName = placeNameMapping[activity.placeId]
      })
    })
  })

  return dayToPlaceToActivities
}

function PlaceName({
  placeId,
  placeName,
}: {
  placeId: string
  placeName: string
}) {
  return (
    <Text as={Link} {...linkStyled} to={pathPlaceDetail({ placeId })}>
      {placeName}
    </Text>
  )
}

function useActivitiesMapping({
  filter,
  userId,
}: {
  filter: "everything" | "checkins"
  userId: string
}) {
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
    ActivitiesAggregated | "loading" | "error"
  >("loading")
  const activities = useActivities({ filter, userId })

  useEffect(() => {
    let cancel = false
    if (activities === "error" || activities === "loading") {
      return
    }
    convertActivities(activities)
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

export function ActivityView() {
  type SelectOption = "everything" | "checkins"
  const [filter, setFilter] = useState<SelectOption>("checkins")
  const user = useUser()

  const activityDays = useActivitiesMapping({
    filter,
    userId: user.data?.uid ?? "",
  })

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
      <VStack spacing={6} align="start" width="100%">
        {activityDays === "error" ? (
          <div>Error</div>
        ) : activityDays === "loading" ? (
          <div>Loading...</div>
        ) : (
          Object.entries(activityDays).map(([day, placesWithActivities]) => (
            <Box key={day} width={"100%"}>
              <Box borderBottomWidth={"1px"} marginBottom={2}>
                {formatHumanDate(new Date(day))}
              </Box>
              <VStack spacing={3} width="100%" alignItems={"start"}>
                {Object.entries(placesWithActivities).map(
                  ([placeId, { activities, placeName }]) => (
                    <Box key={placeId} w="100%">
                      <Box>
                        <PlaceName placeId={placeId} placeName={placeName} />
                      </Box>
                      {activities.map((a) => {
                        return (
                          <Activity key={a.id} type={a.type} activity={a} />
                        )
                      })}
                    </Box>
                  ),
                )}
              </VStack>
            </Box>
          ))
        )}
      </VStack>
    </Page>
  )
}
