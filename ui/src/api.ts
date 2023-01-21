import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore"

import {
  Friend,
  Place,
  PlaceCheckIn,
  PlaceMenuItem,
  User,
  UserSchema,
} from "./api-schemas"
import { db } from "./db"

export async function placeCreate(params: {
  name: string
  location: string
  userId: string
  friendIds: string[]
}): Promise<Place["id"]> {
  const place: Omit<Place, "id"> = {
    name: params.name,
    location: params.location,
    createdById: params.userId,
    createdAt: Timestamp.now(),
    lastModifiedAt: null,
    lastModifiedById: null,
    viewerIds: [params.userId, ...params.friendIds],
    checkInCount: 0,
    menuItemCount: 0,
  }
  const docRef = await addDoc(collection(db, "places"), place)
  return docRef.id
}

type DocUpdateFields = "lastModifiedAt" | "lastModifiedById"

export async function placeUpdate(params: {
  placeId: string
  name: string
  location: string
  userId: string
}): Promise<void> {
  const place: Pick<Place, "name" | "location" | DocUpdateFields> = {
    name: params.name,
    location: params.location,
    lastModifiedAt: Timestamp.now(),
    lastModifiedById: params.userId,
  }
  await updateDoc(doc(db, "places", params.placeId), place)
}
export async function placeDelete(params: { placeId: string }): Promise<void> {
  await deleteDoc(doc(db, "places", params.placeId))
}

export const checkin = {
  async create(params: {
    placeId: string
    date: Date
    userId: string
    comment: string
    reviews: { menuItemId: string; rating: -1 | 1; comment: string }[]
  }) {
    const checkin: Omit<PlaceCheckIn, "id"> = {
      createdAt: Timestamp.now(),
      createdById: params.userId,
      lastModifiedAt: null,
      lastModifiedById: null,
      comment: params.comment,
      ratings: params.reviews,
    }
    const res = await addDoc(
      collection(db, "places", params.placeId, "checkins"),
      checkin,
    )
    return res.id
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
    }
    const res = await addDoc(
      collection(db, "places", params.placeId, "menuitems"),
      menuItem,
    )
    return res.id
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

export async function userById({ userId }: { userId: string }): Promise<User> {
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  const res = await getDoc(doc(db, "users", userId))
  return UserSchema.parse({ id: res.id, ...res.data() })
}
