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
import { useQuery } from "@tanstack/react-query"
import { formatISO } from "date-fns"
import {
  collectionGroup,
  getDocsFromServer,
  orderBy as orderBy_,
  query,
  where,
} from "firebase/firestore"
import { orderBy } from "lodash-es"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { placeById, userById } from "../api"
import {
  Activity,
  Place,
  PlaceCheckIn,
  PlaceCheckInSchema,
} from "../api-schemas"
import { assertNever } from "../assertNever"
import { Page } from "../components/Page"
import { formatHumanDate, formatHumanDateTime } from "../date"
import { db } from "../db"
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

async function getPlaceMapping(
  placeIds: Array<string>,
): Promise<Record<string, Place>> {
  const results = await Promise.all(
    placeIds.map((placeId) => placeById({ placeId })),
  )
  let mapping: Record<string, Place> = {}
  results.forEach((element) => {
    mapping[element.id] = element
  })
  return mapping
}

type ActivityJoined = Activity & { createdByName: string; place: Place }
type PlaceId = string
type DayStr = string

type PlaceCheckInJoined = PlaceCheckIn & {
  createdByName: string
  place: Place | null
}
type PlaceCheckinAggregated = Record<
  DayStr,
  Record<PlaceId, { activities: PlaceCheckInJoined[]; place: Place | null }>
>

function convertCheckins(
  orderedCheckins: PlaceCheckIn[],
  userNameMapping: Record<string, string>,
  placeMap: Record<string, Place>,
): PlaceCheckinAggregated {
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
    dayToCheckins[key].push({ ...checkin, createdByName: "", place: null })

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
          place: null,
          activities: [],
        }
      }
      dayToPlaceCheckins[day][checkin.placeId].activities.push(checkin)
    })
  })

  Object.values(dayToPlaceCheckins).forEach((placeIdToActivities) => {
    Object.values(placeIdToActivities).forEach((place) => {
      place.activities.forEach((activity) => {
        activity.createdByName = userNameMapping[activity.createdById]
        activity.place = placeMap[activity.placeId]
        place.place = placeMap[activity.placeId]
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

  const [userNameMapping, placeMap] = await Promise.all([
    getUserNameMapping([...createdByIds]),
    getPlaceMapping([...placeIds]),
  ])

  return orderedActivities.map((a): ActivityJoined => {
    const place = placeMap[a.placeId]
    const createdByName = userNameMapping[a.createdById]
    return { ...a, place, createdByName }
  })
}

async function getActivities(userId: string): Promise<PlaceCheckinAggregated> {
  const res = await getDocsFromServer(
    query(
      collectionGroup(db, "checkins"),
      where("viewerIds", "array-contains", userId),
      orderBy_("checkedInAt", "desc"),
    ),
  )

  const docs = res.docs.map((doc) =>
    PlaceCheckInSchema.parse({ id: doc.id, ...doc.data() }),
  )

  const placeIds = docs.map((d) => d.placeId)
  const createdByIds = docs.map((d) => d.createdById)

  const [userNameMapping, placeMap] = await Promise.all([
    getUserNameMapping([...createdByIds]),
    getPlaceMapping([...placeIds]),
  ])

  return convertCheckins(docs, userNameMapping, placeMap)
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
        {activity.place.name}
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
  const checkins = useQuery({
    queryKey: ["activities"],
    queryFn: () => getActivities(userId),
    cacheTime: 0,
  })

  return (
    <VStack spacing={6} align="start" width="100%">
      {checkins.isError ? (
        <div>Error</div>
      ) : checkins.isLoading ? (
        <div>Loading...</div>
      ) : (
        Object.entries(checkins.data).map(([day, placesWithCheckins]) => (
          <Box key={day} width={"100%"}>
            <Box borderBottomWidth={"1px"} marginBottom={2}>
              {formatHumanDate(new Date(day))}
            </Box>
            <VStack spacing={3} width="100%" alignItems={"start"}>
              {orderBy(
                Object.entries(placesWithCheckins),
                ([, { place }]) => place?.name,
              ).map(([placeId, { activities: checkins, place }]) => (
                <Box
                  key={placeId}
                  w="100%"
                  color={place?.isSkippableAt ? "gray.600" : undefined}
                >
                  <Box>
                    <Text
                      as={Link}
                      fontWeight={500}
                      textDecorationLine={
                        place?.isSkippableAt ? "line-through" : undefined
                      }
                      to={pathPlaceDetail({ placeId })}
                    >
                      {place?.name}
                    </Text>
                  </Box>
                  {orderBy(checkins, (c) => c.createdByName).map((c, index) => {
                    return (
                      <React.Fragment key={c.id}>
                        <Text
                          as={Link}
                          fontWeight={"bold"}
                          to={pathCheckinDetail({
                            placeId: c.placeId,
                            checkInId: c.id,
                          })}
                        >
                          {c.createdByName}
                        </Text>
                        {index < checkins.length - 1 ? ", " : ""}
                      </React.Fragment>
                    )
                  })}
                </Box>
              ))}
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
