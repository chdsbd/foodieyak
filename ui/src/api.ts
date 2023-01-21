import {
  addDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Friend, Place, User, UserSchema } from "./api-schemas";
import { db } from "./db";

export async function placeCreate(params: {
  name: string;
  location: string;
  userId: string;
  friendIds: string[];
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
  };
  const docRef = await addDoc(collection(db, "places"), place);
  return docRef.id;
}
export async function placeUpdate(params: {
  placeId: string;
  name: string;
  location: string;
}): Promise<void> {
  const place: Pick<Place, "name" | "location"> = {
    name: params.name,
    location: params.location,
  };
  await updateDoc(doc(db, "places", params.placeId), place);
}
export async function placeDelete(params: { placeId: string }): Promise<void> {
  await deleteDoc(doc(db, "places", params.placeId));
}

export async function friendLookup({
  email,
}: {
  email: string;
}): Promise<User[]> {
  const matchingDocs = await getDocs(
    query(
      collection(db, `users`),
      where("emailLowerCase", "==", email.toLowerCase())
    )
  );
  const results: User[] = [];
  matchingDocs.forEach((doc) => [
    results.push(UserSchema.parse({ ...doc.data(), id: doc.id })),
  ]);
  return results;
}

export async function friendInviteCreate({
  userId,
  targetUserId,
}: {
  userId: string;
  targetUserId: string;
}): Promise<void> {
  type FriendCreate = Omit<Friend, "id">;
  let newFriend: FriendCreate = {
    createdById: userId,
    lastModifiedAt: null,
    lastModifiedById: null,
    accepted: false,
    acceptedAt: null,
    createdAt: Timestamp.now(),
  };
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await setDoc(doc(db, `users`, userId, `friends`, targetUserId), newFriend);
  await setDoc(doc(db, `users`, targetUserId, `friends`, userId), newFriend);
}

export async function friendInviteCancel({
  userId,
  targetUserId,
}: {
  userId: string;
  targetUserId: string;
}): Promise<void> {
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await deleteDoc(doc(db, `users`, userId, `friends`, targetUserId));
  await deleteDoc(doc(db, `users`, targetUserId, `friends`, userId));
}

export async function friendInviteAccept({
  userId,
  targetUserId,
}: {
  userId: string;
  targetUserId: string;
}): Promise<void> {
  type FriendUpdate = Pick<Friend, "accepted" | "acceptedAt">;

  const update: FriendUpdate = {
    accepted: true,
    acceptedAt: Timestamp.now(),
  };
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await updateDoc(doc(db, `users`, userId, `friends`, targetUserId), update);
  await updateDoc(doc(db, `users`, targetUserId, `friends`, userId), update);
}

export async function userById({ userId }: { userId: string }): Promise<User> {
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  const res = await getDoc(doc(db, "users", userId));
  return UserSchema.parse({ id: res.id, ...res.data() });
}
