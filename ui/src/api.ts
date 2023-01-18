import {
  addDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
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
  createdByUserId: User["id"];
  menuItems: PlaceMenuItem[];
  checkIns: PlaceCheckIn[];
};

export type PlaceMenuItem = {
  id: string;
  name: string;
  createdBy: string;
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
}): Promise<Place["id"]> {
  const place: Omit<Place, "id"> = {
    name: params.name,
    location: params.location,
    createdByUserId: params.userId,
    menuItems: [],
    checkIns: [],
  };
  const docRef = await addDoc(collection(db, "places"), place);
  return docRef.id;
}

export type UserFoodieYak = {
  id: string;
  displayName: string;
  email: string;
  emailLookupField: string;
  createdAt: string;
};

export async function friendLookup({
  email,
}: {
  email: string;
}): Promise<UserFoodieYak[]> {
  console.log(email);
  const matchingDocs = await getDocs(
    query(
      collection(db, `users`),
      where("emailLookupField", "==", email.toLowerCase())
    )
  );
  const results: UserFoodieYak[] = [];
  matchingDocs.forEach((doc) => [results.push({ ...doc.data(), id: doc.id })]);
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
  await setDoc(doc(db, `users/${userId}/friends`, targetUserId), {
    invitedAt: new Date(),
    accepted: false,
    acceptedAt: null,
  });
  await setDoc(doc(db, `users/${targetUserId}/friends`, userId), {
    invitedAt: new Date(),
    accepted: false,
    acceptedAt: null,
  });
}
