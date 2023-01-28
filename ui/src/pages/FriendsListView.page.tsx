import {
  Button,
  Heading,
  HStack,
  Spacer,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import * as api from "../api"
import { Friend } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { formatHumanDateTime } from "../date"
import { useFriends, useUser } from "../hooks"
import { pathFriendsCreate } from "../paths"

// HACK(chdsbd): This is horrible.
const userIdcache: Record<string, string | undefined> = {}

export function UserIdToName({ userId }: { userId: string }) {
  const [name, setName] = useState<{ name: string } | "loading">("loading")
  useEffect(() => {
    api
      .userById({ userId })
      .then((res) => {
        userIdcache[userId] = res.email
        setName({ name: res.email })
      })
      .catch(() => {
        // TODO:
      })
  }, [userId])
  const nameCacheEntry = userIdcache[userId]
  if (nameCacheEntry != null) {
    return <> {nameCacheEntry}</>
  }
  if (name === "loading") {
    return null
  }
  return <>{name.name}</>
}

function Invite({ i, userId }: { i: Friend; userId: string }) {
  const toast = useToast()
  return (
    <HStack key={i.id} width={"100%"}>
      <VStack spacing={0} align={"start"}>
        <div>
          <UserIdToName userId={i.id} />
        </div>
        <div>{formatHumanDateTime(i.createdAt)}</div>
      </VStack>
      <Spacer />

      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (!confirm("Remove invite?")) {
            return
          }
          api
            .friendInviteCancel({
              userId,
              targetUserId: i.id,
            })
            .then(() => {
              toast({
                title: "Invite canceled",
                status: "success",
                isClosable: true,
              })
            })
            .catch((error: FirebaseError) => {
              const errorCode = error.code
              const errorMessage = error.message
              toast({
                title: "Problem canceling invite",
                description: `${errorCode}: ${errorMessage}`,
                status: "error",
                isClosable: true,
              })
            })
        }}
      >
        Cancel
      </Button>
      {i.createdById !== userId && (
        <Button
          size="sm"
          onClick={() => {
            api
              .friendInviteAccept({
                userId,
                targetUserId: i.id,
              })
              .then(() => {
                toast({
                  title: "Invite accepted",
                  status: "success",
                  isClosable: true,
                })
              })
              .catch((error: FirebaseError) => {
                toast({
                  title: "Problem accepting invite",
                  description: `${error.code}: ${error.message}`,
                  status: "error",
                  isClosable: true,
                })
              })
          }}
        >
          Accept
        </Button>
      )}
    </HStack>
  )
}

function FriendItem({ f, userId }: { f: Friend; userId: string }) {
  const toast = useToast()
  return (
    <HStack width="100%">
      <div>
        <UserIdToName userId={f.id} />
      </div>
      <Spacer />
      <Button
        size={"sm"}
        onClick={() => {
          if (!confirm("Remove friend?")) {
            return
          }
          api
            .friendInviteCancel({
              userId,
              targetUserId: f.id,
            })
            .then(() => {
              toast({
                title: "Friend removed",
                status: "success",
                isClosable: true,
              })
            })
            .catch((error: FirebaseError) => {
              toast({
                title: "Problem removing friend",
                description: `${error.code}: ${error.message}`,
                status: "error",
                isClosable: true,
              })
            })
        }}
      >
        remove
      </Button>
    </HStack>
  )
}

export function FriendsListView() {
  const user = useUser()
  const friends = useFriends(user.data?.uid ?? "")
  if (user.data == null || friends === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }
  return (
    <Page>
      <HStack w="100%" alignItems={"center"}>
        <Heading as="h1" size="lg">
          Friends
        </Heading>
        <Spacer />
        <Link to={pathFriendsCreate({})}>
          <Button size="sm">Invite Friend</Button>
        </Link>
      </HStack>
      {friends.length === 0 && <EmptyStateText>No Friends</EmptyStateText>}
      {friends.map((f) => {
        if (!f.accepted) {
          return <Invite key={f.id} i={f} userId={user.data.uid} />
        }
        return <FriendItem key={f.id} f={f} userId={user.data.uid} />
      })}
    </Page>
  )
}
