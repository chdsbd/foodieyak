import { getAuth, onAuthStateChanged, User } from "firebase/auth"
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  onSnapshot,
  Query,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { z } from "zod"

import {
  FriendSchema,
  Place,
  PlaceCheckInSchema,
  PlaceMenuItemSchema,
  PlaceSchema,
} from "./api-schemas"
import { db } from "./db"

function useQuery<T>(
  query: Query<DocumentData> | false,
  schema: z.ZodType<T>,
): T[] | "loading"
function useQuery<T>(
  query: DocumentReference<DocumentData> | false,
  schema: z.ZodType<T>,
): T | "loading"
function useQuery<T>(
  query: Query<DocumentData> | DocumentReference<DocumentData> | false,
  schema: z.ZodType<T>,
): T | T[] | "loading" {
  const [state, setState] = useState<T | "loading">("loading")
  useEffect(() => {
    if (query === false) {
      return
    }
    if (query.type === "document") {
      return onSnapshot(query, (doc) => {
        const parsed = schema.parse({ id: doc.id, ...doc.data() })
        setState(parsed)
      })
    } else {
      return onSnapshot(query, (querySnapshot) => {
        const out: T[] = []
        querySnapshot.forEach((doc) => {
          const parsed = schema.parse({ id: doc.id, ...doc.data() })
          out.push(parsed)
        })
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        setState(out as T)
      })
    }
  }, [query, schema])

  return state
}

export function useIsAuthed(): "authed" | "unauthed" | "loading" {
  const [state, setState] = useState<"authed" | "unauthed" | "loading">(
    "loading",
  )
  useEffect(() => {
    const auth = getAuth()
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setState("authed")
      } else {
        setState("unauthed")
      }
    })
  }, [])
  return state
}

type QueryResult =
  | { data: User; isLoading: false; isSuccess: true }
  | { data: undefined; isLoading: true; isSuccess: false }

export function useUser(): QueryResult {
  const [state, setState] = useState<QueryResult>({
    data: undefined,
    isLoading: true,
    isSuccess: false,
  })
  useEffect(() => {
    const auth = getAuth()
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({ data: user, isLoading: false, isSuccess: true })
      } else {
        setState({ data: undefined, isLoading: true, isSuccess: false })
      }
    })
  }, [])
  return state
}

export function usePlace(placeId: string): Place | "loading" {
  return useQuery(doc(db, "places", placeId), PlaceSchema)
}

export function useMenuItems(placeId: string) {
  return useQuery(
    query(collection(db, "places", placeId, "menuitems")),
    PlaceMenuItemSchema,
  )
}
export function useMenuItem(placeId: string, menuItemId: string) {
  return useQuery(
    doc(collection(db, "places", placeId, "menuitems", menuItemId)),
    PlaceMenuItemSchema,
  )
}
export function useCheckins(placeId: string) {
  return useQuery(
    query(collection(db, "places", placeId, "checkins")),
    PlaceCheckInSchema,
  )
}

export function useCheckIn(placeId: string, checkInId: string) {
  return useQuery(
    doc(collection(db, "places", placeId, "checkins", checkInId)),
    PlaceCheckInSchema,
  )
}

export function usePlaces(userId: string | undefined) {
  return useQuery(
    !!userId &&
      query(
        collection(db, "places"),
        where("viewerIds", "array-contains", userId),
      ),
    PlaceSchema,
  )
}

export function useFriends(userId: string | null) {
  return useQuery(
    !!userId && query(collection(db, `users`, userId, "friends")),
    FriendSchema,
  )
}
