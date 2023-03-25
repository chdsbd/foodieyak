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
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { placeById } from "../api"
import { Activity } from "../api-schemas"
import { assertNever } from "../assertNever"
import { Page } from "../components/Page"
import { formatHumanDateTime } from "../date"
import { useActivities, useUser } from "../hooks"
import {
  pathCheckinDetail,
  pathMenuItemDetail,
  pathPlaceDetail,
} from "../paths"
import { UserIdToName } from "./FriendsListView.page"

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

function Action({
  update,
  placeId,
  activity,
}: {
  update: ActivityType
  placeId: string
  activity: Activity
}) {
  const description = updateDescription({
    update,
    placeId,
    activity,
  })
  const placeName = usePlaceName({ placeId })
  return (
    <>
      {description}{" "}
      <Text as={Link} {...linkStyled} to={pathPlaceDetail({ placeId })}>
        {placeName}
      </Text>
    </>
  )
}

function Description({
  update,
  placeId,
  activity,
}: {
  placeId: string
  update: ActivityType
  activity: Activity
}) {
  return (
    <HStack spacing={1}>
      <div>
        <span style={{ fontWeight: "bold" }}>
          <UserIdToName userId={activity.createdById} />
        </span>{" "}
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

function Activity({
  document,
  type,
  timestamp,
  activity,
}: {
  document: Activity["document"]
  type: ActivityType
  timestamp: Activity["createdAt"]
  activity: Activity
}) {
  return (
    <HStack spacing={3}>
      <ActionIcon type={type} document={document} />

      <VStack align="start" spacing={0}>
        <Description
          update={type}
          placeId={activity.placeId}
          activity={activity}
        />
        <ActivityTimestamp timestamp={timestamp} />
      </VStack>
    </HStack>
  )
}

export function ActivityView() {
  type SelectOption = "everything" | "checkins"
  const [filter, setFilter] = useState<SelectOption>("checkins")
  const user = useUser()
  const activities = useActivities({ filter, userId: user.data?.uid ?? "" })
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
      <VStack spacing={4} align="start">
        {activities.map((a) => {
          return (
            <Activity
              key={a.id}
              document={a.document}
              type={a.type}
              timestamp={a.createdAt}
              activity={a}
            />
          )
        })}
      </VStack>
    </Page>
  )
}
