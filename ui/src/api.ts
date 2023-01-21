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
} from "firebase/firestore";
import { db } from "./db";

export type User = {
  id: string;
  email: string;
  name?: string;
  friends: User[];
};

export type Place = {
  id: string;
  name: string;
  location: string;
  createdById: User["id"];
  viewerIds: User["id"][];
  menuItemCount: number | undefined;
  checkInCount: number | undefined;
};

export type PlaceMenuItem = {
  id: string;
  name: string;
  createdById: string;
};

export type CheckInRating = {
  id: string;
  menuItemId: string;
  rating: 1 | -1;
};

export type PlaceCheckIn = {
  id: string;
  userId: User["id"];
  createdAt: string;
  ratings: CheckInRating[];
};

export type UserInvite = {
  id: string;
  invitedByUserId: User["id"];
  inviteeEmailAddress: string;
  createdAt: string;
};

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

export type UserFoodieYak = {
  id: string;
  displayName: string | null;
  email: string;
  emailLookupField: string;
};

export async function friendLookup({
  email,
}: {
  email: string;
}): Promise<UserFoodieYak[]> {
  const matchingDocs = await getDocs(
    query(
      collection(db, `users`),
      where("emailLowerCase", "==", email.toLowerCase())
    )
  );
  const results: UserFoodieYak[] = [];
  matchingDocs.forEach((doc) => [
    results.push({ ...doc.data(), id: doc.id } as UserFoodieYak),
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
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await setDoc(doc(db, `users`, userId, `friends`, targetUserId), {
    invitedAt: new Date(),
    createdById: userId,
    accepted: false,
    acceptedAt: null,
  });
  await setDoc(doc(db, `users`, targetUserId, `friends`, userId), {
    invitedAt: new Date(),
    createdById: userId,
    accepted: false,
    acceptedAt: null,
  });
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
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  await updateDoc(doc(db, `users`, userId, `friends`, targetUserId), {
    accepted: true,
    acceptedAt: new Date(),
  });
  await updateDoc(doc(db, `users`, targetUserId, `friends`, userId), {
    accepted: true,
    acceptedAt: new Date(),
  });
}

type DbUser = { id: string; email: string };

export async function userById({
  userId,
}: {
  userId: string;
}): Promise<DbUser> {
  // /users/{user}/friends/{target}
  // /users/{target}/friends/{user}
  const res = await getDoc(doc(db, "users", userId));
  return { id: res.id, ...res.data() } as DbUser;
}
