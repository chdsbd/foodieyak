import { addDoc, collection } from "firebase/firestore";
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
