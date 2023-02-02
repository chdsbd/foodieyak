import {
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  User,
} from "firebase/auth"
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  limit,
  onSnapshot,
  orderBy,
  Query,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
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
      const start = performance.now()
      return onSnapshot(query, (querySnapshot) => {
        const out: T[] = []
        querySnapshot.forEach((doc) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = schema.parse({ id: doc.id, ...doc.data() })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          out.push(parsed)
        })
        console.log(query?._query?._t?.ft)
        console.log(`query-time`, performance.now() - start)
        setState(out)
      })
    }
  }, [query, schema])

  return state
}

export function useIsAuthed(): "authed" | "unauthed" | "loading" {
  const [state, setState] = useState<"authed" | "unauthed" | "loading">(
    localStorage.getItem("isAuthenticated") != null ? "authed" : "loading",
  )
  useEffect(() => {
    const auth = getAuth()
    return onIdTokenChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("isAuthenticated", "1")
        setState("authed")
      } else {
        localStorage.removeItem("isAuthenticated")
        setState("unauthed")
      }
    })
  }, [])
  return state
}

type FyUser = Pick<User, "uid" | "email" | "displayName" | "photoURL">

const FyUserSchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string().default(""),
  photoURL: z.string().default(""),
})

type QueryResult =
  | {
      data: FyUser
      isLoading: false
      isSuccess: true
    }
  | { data: undefined; isLoading: true; isSuccess: false }

export function useUser(): QueryResult {
  const [state, setState] = useState<QueryResult>((): QueryResult => {
    const cached = localStorage.getItem("userAuthDataCache")
    if (cached) {
      const res = FyUserSchema.safeParse(JSON.parse(cached))
      if (res.success) {
        return {
          data: res.data,
          isLoading: false,
          isSuccess: true,
        }
      }
    }
    return { data: undefined, isLoading: true, isSuccess: false }
  })
  useEffect(() => {
    const auth = getAuth()
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("userAuthDataCache", JSON.stringify(user))
        setState({ data: user, isLoading: false, isSuccess: true })
      } else {
        localStorage.removeItem("userAuthDataCache")
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
      orderBy("createdAt", "desc"),
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
    console.log("hasUserId", { userId })
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
export function usePlaces2(userId: string) {
  const { status, data } = useFirestoreCollectionData(
    query(
      collection(db, "places"),
      where("viewerIds", "array-contains", userId),
      orderBy("name", "asc"),
    ),
    {
      idField: "id", // this field will be added to the object created from each document
    },
  )
  if (status !== "success") {
    return "loading"
  }
  return data.map((x) => PlaceSchema.parse(x))
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

export function useLastVisitedOn(placeId: string, userId: string) {
  const { status, data, error } = useFirestoreCollectionData(
    query(
      collection(db, "places", placeId, "checkins"),
      where("createdById", "==", userId),
      orderBy("createdAt", "desc"),
      limit(1),
    ),
    {
      idField: "id", // this field will be added to the object created from each document
    },
  )
  if (status === "error") {
    throw error
  }
  if (status === "loading") {
    return "loading"
  }
  if (data.length === 0) {
    return null
  }
  return PlaceCheckInSchema.parse(data[0]).createdAt
}
