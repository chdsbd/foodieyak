import { getAuth, onAuthStateChanged, User } from "firebase/auth"
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  onSnapshot,
  orderBy,
  Query,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { z } from "zod"

import {
  FriendSchema,
  Place,
  PlaceCheckInSchema,
  PlaceMenuItemSchema,
  PlaceSchema,
} from "./api-schemas"
import { db } from "./db"

function useQuery<T extends z.ZodType>(
  query: Query<DocumentData> | null,
  schema: T,
): z.output<T>[] | "loading"
function useQuery<T extends z.ZodType>(
  query: DocumentReference<DocumentData> | null,
  schema: T,
): z.output<T> | "loading"
function useQuery<T extends z.ZodType>(
  query: Query<DocumentData> | DocumentReference<DocumentData> | null,
  schema: T,
): z.output<T> | z.output<T>[] | "loading" {
  const [state, setState] = useState<T | T[] | "loading">("loading")
  useEffect(() => {
    if (query == null) {
      return
    }
    if (query.type === "document") {
      return onSnapshot(query, (doc) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = schema.parse({ id: doc.id, ...doc.data() })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setState(parsed)
      })
    } else {
      return onSnapshot(query, (querySnapshot) => {
        const out: T[] = []
        querySnapshot.forEach((doc) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = schema.parse({ id: doc.id, ...doc.data() })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          out.push(parsed)
        })
        setState(out)
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
  const q = useMemo(() => {
    return doc(db, "places", placeId)
  }, [placeId])
  return useQuery(q, PlaceSchema)
}

export function useMenuItems(placeId: string) {
  const q = useMemo(() => {
    return query(
      collection(db, "places", placeId, "menuitems"),
      orderBy("name"),
    )
  }, [placeId])
  return useQuery(q, PlaceMenuItemSchema)
}
export function useMenuItem(placeId: string, menuItemId: string) {
  const q = useMemo(() => {
    return doc(db, "places", placeId, "menuitems", menuItemId)
  }, [placeId, menuItemId])

  return useQuery(q, PlaceMenuItemSchema)
}
export function useCheckins(placeId: string) {
  const q = useMemo(() => {
    return query(
      collection(db, "places", placeId, "checkins"),
      orderBy("checkedInAt", "desc"),
    )
  }, [placeId])
  return useQuery(q, PlaceCheckInSchema)
}

export function useCheckIn(placeId: string, checkInId: string) {
  const q = useMemo(() => {
    return doc(db, "places", placeId, "checkins", checkInId)
  }, [placeId, checkInId])
  return useQuery(q, PlaceCheckInSchema)
}

export function usePlaces(userId: string | undefined) {
  const q = useMemo(() => {
    if (!userId) {
      return null
    }
    return query(
      collection(db, "places"),
      where("viewerIds", "array-contains", userId),
      orderBy("name", "asc"),
    )
  }, [userId])
  return useQuery(q, PlaceSchema)
}

export function useFriends(userId: string | null) {
  const q = useMemo(() => {
    if (!userId) {
      return null
    }
    return query(collection(db, "users", userId, "friends"))
  }, [userId])
  return useQuery(q, FriendSchema)
}
