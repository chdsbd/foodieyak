import { uniqueId } from "lodash-es";
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
  createdBy: User["id"];
  menu: MenuEntry[];
  checkIns: CheckIn[];
};

export type CheckIn = {
  id: string;
  userId: User["id"];
  createdAt: string;
  ratings: {
    id: string;
    menuItem: {
      id: string;
      name: string;
    };
    rating: 1 | -1;
  }[];
};

export type Rating = {
  id: string;
  userId: User["id"];
  createdAt: string;
  rating: 1 | -1;
};

export type MenuEntry = {
  id: string;
  name: string;
  ratings: Rating[];
};

const db: { places: Place[] } = {
  places: [],
};

export async function placeCreate(params: {
  name: string;
  location: string;
  userId: string;
}): Promise<Place> {
  const place: Place = {
    id: uniqueId("place_"),
    name: params.name,
    location: params.location,
    createdBy: params.userId,
    menu: [],
    checkIns: [],
  };
  db.places.push(place);
  return place;
}

export async function placeGet(params: {
  id: string;
}): Promise<Place | undefined> {
  return db.places.find((x) => x.id === params.id);
}
