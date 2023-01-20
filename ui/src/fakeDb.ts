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

const db: { places: Place[]; users: User[]; user_invites: UserInvite[] } = {
  places: [],
  users: [],
  user_invites: [],
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
    createdByUserId: params.userId,
    menuItems: [],
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

export async function placeList(): Promise<Place[]> {
  return db.places;
}

export async function checkInCreate(params: {
  placeId: string;
  date: string;
  reviews: {
    menuItemId: string;
    rating: 1 | -1;
  }[];
  userId: string;
}): Promise<PlaceCheckIn> {
  const place = db.places.find((x) => x.id === params.placeId);
  if (place == null) {
    throw Error("Could not find place with provided placeId");
  }
  const ratings: CheckInRating[] = params.reviews.map((x) => {
    return {
      id: uniqueId("rating_"),
      menuItemId: x.menuItemId,
      rating: x.rating,
    };
  });
  const checkIn: PlaceCheckIn = {
    id: uniqueId("checkin_"),
    createdAt: params.date,
    ratings: ratings,
    userId: params.userId,
  };
  place.checkIns = [...place.checkIns, checkIn];
  return checkIn;
}

export async function menuItemCreate(params: {
  placeId: string;
  name: string;
  userId: string;
}): Promise<PlaceMenuItem> {
  const place = db.places.find((x) => x.id === params.placeId);
  if (place == null) {
    throw Error("Could not find place with provided placeId");
  }

  const menuItem: PlaceMenuItem = {
    id: uniqueId("menuitem_"),
    name: params.name,
    createdBy: params.userId,
  };
  place.menuItems = [...place.menuItems, menuItem];
  return menuItem;
}

export async function friendsList(params: { userId: string }): Promise<User[]> {
  const user = db.users.find((x) => x.id === params.userId);

  return user?.friends ?? [];
}

export async function invitesCreate(params: {
  userId: string;
  inviteeEmailAddress: string;
}): Promise<UserInvite> {
  const userInvite = {
    createdAt: new Date().toISOString(),
    id: uniqueId("user_invite_"),
    invitedByUserId: params.userId,
    inviteeEmailAddress: params.inviteeEmailAddress,
  };

  db.user_invites.push(userInvite);
  return userInvite;
}

export async function invitesList(params: {
  userId: string;
}): Promise<UserInvite[]> {
  return db.user_invites.filter((x) => x.invitedByUserId === params.userId);
}
