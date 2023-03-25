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
import { groupBy, map } from "lodash-es"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { placeById } from "../api"
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
import { UserIdToName } from "./FriendsListView.page"

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

function usePlaceName({ placeId }: { placeId: string }): string {
  const [name, setName] = useState("")
  useEffect(() => {
    let unmount = false
    placeById({ placeId })
      .then((data) => {
        if (unmount) {
          return
        }
        setName(data.name)
      })
      .catch(() => {
        // todo
      })
    return () => {
      unmount = true
    }
  }, [placeId])

  return name
}

function Activity({
  type,
  activity,
}: {
  type: ActivityType
  activity: Activity
}) {
  const description = updateDescription({
    update: type,
    placeId: activity.placeId,
    activity,
  })
  return (
    <HStack spacing={1} width="100%" justifyContent={"space-between"}>
      <div>
        <span style={{ fontWeight: "bold" }}>
          <UserIdToName userId={activity.createdById} />
        </span>{" "}
        {description}{" "}
      </div>
      <Box>{format(activity.createdAt.toDate(), "h:mmaaa")}</Box>
    </HStack>
  )
}

function convertActivities(orderedActivities: Activity[]): {
  date: string
  placesWithActivities: { placeId: string; activities: Activity[] }[]
}[] {
  return map(
    groupBy(orderedActivities, (x) =>
      formatISO(x.createdAt.toDate(), {
        representation: "date",
      }),
    ),
    (activities, date) => {
      const placeActivities = map(
        groupBy(activities, (x) => x.placeId),
        (activities, placeId) => ({ activities, placeId }),
      )

      return { placesWithActivities: placeActivities, date }
    },
  )
}

function PlaceIdToName({ placeId }: { placeId: string }) {
  const placeName = usePlaceName({ placeId })

  return (
    <Text as={Link} {...linkStyled} to={pathPlaceDetail({ placeId })}>
      {placeName}
    </Text>
  )
}

export function ActivityView() {
  type SelectOption = "everything" | "checkins"
  const [filter, setFilter] = useState<SelectOption>("checkins")
  const user = useUser()
  const activities = useActivities({ filter, userId: user.data?.uid ?? "" })
  const activityDays = convertActivities(activities)

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
        {activityDays.map((day) => (
          <Box key={day.date} width={"100%"}>
            <Box borderBottomWidth={"1px"} marginBottom={2}>
              {formatHumanDate(new Date(day.date))}
            </Box>
            <VStack spacing={3} width="100%" alignItems={"start"}>
              {day.placesWithActivities.map((place) => (
                <Box key={place.placeId} w="100%">
                  <Box>
                    <PlaceIdToName placeId={place.placeId} />
                  </Box>
                  {place.activities.map((a) => {
                    return <Activity key={a.id} type={a.type} activity={a} />
                  })}
                </Box>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Page>
  )
}
