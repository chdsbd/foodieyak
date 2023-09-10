import { startOfDay } from "date-fns"
import { getAuth, updateProfile } from "firebase/auth"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore"
import { first } from "lodash-es"

import {
  Friend,
  Place,
  PlaceCheckIn,
  PlaceCheckInSchema,
  PlaceMenuItem,
  PlaceSchema,
  User,
  UserSchema,
} from "./api-schemas"
import { db } from "./db"

export async function placeCreate(params: {
  name: string
  location: string
  userId: string
  geoInfo: Place["geoInfo"] | null
  friendIds: string[]
}): Promise<Place["id"]> {
  const place: Omit<Place, "id"> = {
    name: params.name,
    location: params.location,
    createdById: params.userId,
    createdAt: Timestamp.now(),
    geoInfo: params.geoInfo,
    lastModifiedAt: null,
    lastModifiedById: null,
    viewerIds: [params.userId, ...params.friendIds],
    checkInCount: 0,
    isSkippableAt: null,
    isSkippableById: null,
    menuItemCount: 0,
  }
  const docRef = await addDoc(collection(db, "places"), place)
  return docRef.id
}

type DocUpdateFields =
  | "lastModifiedAt"
  | "lastModifiedById"
  | "isSkippableAt"
  | "isSkippableById"

export async function placeUpdate(params: {
  placeId: string
  name: string
  location: string
  geoInfo: Place["geoInfo"] | null
  userId: string
  isSkippable: boolean
}): Promise<void> {
  const place: Pick<Place, "name" | "location" | "geoInfo" | DocUpdateFields> =
    {
      name: params.name,
      location: params.location,
      geoInfo: params.geoInfo,
      lastModifiedAt: Timestamp.now(),
      lastModifiedById: params.userId,
      isSkippableAt: params.isSkippable ? Timestamp.now() : null,
      isSkippableById: params.isSkippable ? params.userId : null,
    }
  await updateDoc(doc(db, "places", params.placeId), place)
}
export async function placeDelete(params: { placeId: string }): Promise<void> {
  await deleteDoc(doc(db, "places", params.placeId))
}

export const checkin = {
  async create({
    placeId,
    date,
    userId,
    comment,
    reviews,
    viewerIds,
    quickCheckin = false,
  }: {
    placeId: string
    date: Date | null
    userId: string
    comment: string
    reviews: { menuItemId: string; rating: -1 | 1; comment: string }[]
    viewerIds: string[]
    quickCheckin?: boolean
  }) {
    const checkin: Omit<PlaceCheckIn, "id"> = {
      createdAt: Timestamp.now(),
      checkedInAt: date != null ? Timestamp.fromDate(date) : null,
      createdById: userId,
      lastModifiedAt: null,
      lastModifiedById: null,
      comment,
      viewerIds,
      ratings: reviews,
      quickCheckin,
      ratingsMenuItemIds: reviews.map((x) => x.menuItemId),
      placeId,
    }
    const res = await addDoc(
      collection(db, "places", placeId, "checkins"),
      checkin,
    )
    return res.id
  },
  async createQuickCheckin({
    placeId,
    userId,
    viewerIds,
    review,
  }: {
    placeId: string
    userId: string
    review: { menuItemId: string; rating: -1 | 1 }
    viewerIds: string[]
  }) {
    const q = query(
      collection(db, "places", placeId, "checkins"),
      where("createdAt", ">=", startOfDay(new Date())),
      where("createdById", "==", userId),
      where("quickCheckin", "==", true),
      orderBy("createdAt", "desc"),
      limit(1),
    )

    const existingQuickCheckIns = (await getDocs(q)).docs
    if (existingQuickCheckIns.length === 0) {
      const rating = review.rating
      const menuItemId = review.menuItemId
      await this.create({
        placeId,
        date: new Date(),
        userId,
        comment: "",
        quickCheckin: true,
        reviews: [{ comment: "", rating, menuItemId }],
        viewerIds,
      })
    } else {
      const existingCheckin = existingQuickCheckIns[0]
      await runTransaction(db, async (transaction) => {
        const d = await transaction.get(
          doc(db, "places", placeId, "checkins", existingCheckin.id),
        )
        if (!d.exists()) {
          throw Error("should not happen")
        }
        const checkin = PlaceCheckInSchema.parse({ id: d.id, ...d.data() })

        // update ratings
        const existingMenuRating = checkin.ratings.find(
          (x) => x.menuItemId === review.menuItemId,
        )
        const otherRatings = checkin.ratings.filter(
          (x) => x.menuItemId !== review.menuItemId,
        )

        // if we have an existing rating for a menu item, clicking the button again should remove the rating.
        const shouldAddRating = existingMenuRating?.rating !== review.rating
        if (shouldAddRating) {
          otherRatings.push({
            comment: "",
            menuItemId: review.menuItemId,
            rating: review.rating,
          })
        }
        transaction.update(d.ref, {
          ratings: otherRatings,
          ratingsMenuItemIds: otherRatings.map((x) => x.menuItemId),
        })
      })
    }
  },
  async update({
    placeId,
    checkInId,
    date,
    userId,
    comment,
    reviews,
  }: {
    placeId: string
    checkInId: string
    date: Date | null
    userId: string
    comment: string
    reviews: { menuItemId: string; rating: -1 | 1; comment: string }[]
  }) {
    const checkin: Omit<
      PlaceCheckIn,
      | "id"
      | "createdById"
      | "createdAt"
      | "deleted"
      | "viewerIds"
      | "placeId"
      | "quickCheckin"
    > = {
      checkedInAt: date != null ? Timestamp.fromDate(date) : null,
      lastModifiedAt: Timestamp.now(),
      lastModifiedById: userId,
      comment,
      ratings: reviews,
      ratingsMenuItemIds: reviews.map((x) => x.menuItemId),
    }
    await updateDoc(doc(db, "places", placeId, "checkins", checkInId), checkin)
  },
  async delete({ placeId, checkInId }: { placeId: string; checkInId: string }) {
    await deleteDoc(doc(db, "places", placeId, "checkins", checkInId))
  },
  async getLastestForUserId({
    placeId,
    userId,
  }: {
    placeId: string
    userId: string
  }) {
    const q = query(
      collection(db, "places", placeId, "checkins"),
      where("createdById", "==", userId),
      orderBy("createdAt", "desc"),
      limit(1),
    )
    const res = await getDocs(q)
    const latestDoc = first(res.docs)
    if (latestDoc == null) {
      return null
    }
    return PlaceCheckInSchema.parse({ id: latestDoc.id, ...latestDoc.data() })
  },
}

export const menuItems = {
  async create(params: { name: string; userId: string; placeId: string }) {
    const menuItem: Omit<PlaceMenuItem, "id"> = {
      createdAt: Timestamp.now(),
      createdById: params.userId,
      lastModifiedAt: null,
      lastModifiedById: null,
      name: params.name,
      checkInCount: 0,
    }
    const res = await addDoc(
      collection(db, "places", params.placeId, "menuitems"),
      menuItem,
    )
    return res.id
  },
  async update(params: {
    name: string
    userId: string
    placeId: string
    menuItemId: string
  }) {
    const menuItem: Omit<
      PlaceMenuItem,
      "id" | "createdAt" | "createdById" | "checkInCount"
    > = {
      lastModifiedAt: Timestamp.now(),
      lastModifiedById: params.userId,
      name: params.name,
    }
    await updateDoc(
      doc(db, "places", params.placeId, "menuitems", params.menuItemId),
      menuItem,
    )
  },
  async delete(params: { placeId: string; menuItemId: string }) {
    await deleteDoc(
      doc(db, "places", params.placeId, "menuitems", params.menuItemId),
    )
  },
}

export const user = {
  async updateProfile({
    displayName,
  }: {
    displayName: string | null | undefined
  }) {
    const auth = getAuth()
    if (!auth.currentUser) {
      return
    }
    await updateProfile(auth.currentUser, {
      displayName: displayName || null,
    })
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      displayName: displayName || null,
    })
  },
}

export async function friendLookup({
  email,
}: {
  email: string
}): Promise<User[]> {
  const matchingDocs = await getDocs(
    query(
      collection(db, `users`),
      where("emailLowerCase", "==", email.toLowerCase()),
    ),
  )
  const results: User[] = []
  matchingDocs.forEach((doc) => [
    results.push(UserSchema.parse({ ...doc.data(), id: doc.id })),
  ])
  return results
}

export async function friendInviteCreate({
  userId,
  targetUserId,
}: {
  userId: string
  targetUserId: string
}): Promise<void> {
  type FriendCreate = Omit<Friend, "id">
  let newFriend: FriendCreate = {
    createdById: userId,
    lastModifiedAt: null,
    lastModifiedById: null,
    accepted: false,
    acceptedAt: null,
    createdAt: Timestamp.now(),
  }
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await writeBatch(db)
    .set(doc(db, `users`, userId, `friends`, targetUserId), newFriend)
    .set(doc(db, `users`, targetUserId, `friends`, userId), newFriend)
    .commit()
}

export async function friendInviteCancel({
  userId,
  targetUserId,
}: {
  userId: string
  targetUserId: string
}): Promise<void> {
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await writeBatch(db)
    .delete(doc(db, `users`, userId, `friends`, targetUserId))
    .delete(doc(db, `users`, targetUserId, `friends`, userId))
    .commit()
}

export async function friendInviteAccept({
  userId,
  targetUserId,
}: {
  userId: string
  targetUserId: string
}): Promise<void> {
  type FriendUpdate = Pick<Friend, "accepted" | "acceptedAt">

  const update: FriendUpdate = {
    accepted: true,
    acceptedAt: Timestamp.now(),
  }
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await writeBatch(db)
    .update(doc(db, `users`, userId, `friends`, targetUserId), update)
    .update(doc(db, `users`, targetUserId, `friends`, userId), update)
    .commit()
}

export async function userById({
  userId,
  fromCache = false,
}: {
  userId: string
  fromCache?: boolean
}): Promise<User> {
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  const q = doc(db, "users", userId)
  const res = fromCache ? await getDocFromCache(q) : await getDoc(q)
  return UserSchema.parse({ id: res.id, ...res.data() })
}

export async function placeById({
  placeId,
  fromCache = false,
}: {
  placeId: string
  fromCache?: boolean
}): Promise<Place> {
  const q = doc(db, "places", placeId)
  const res = fromCache ? await getDocFromCache(q) : await getDoc(q)
  return PlaceSchema.parse({ id: res.id, ...res.data() })
}
