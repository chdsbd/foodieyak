import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import React, { useState } from "react";
import { db } from "./db";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import * as api from "./api";

export function useIsAuthed(): "authed" | "unauthed" | "loading" {
  const auth = getAuth();
  const [state, setState] = useState<"authed" | "unauthed" | "loading">(
    "loading"
  );
  React.useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setState("authed");
      } else {
        setState("unauthed");
      }
    });
  }, []);
  return state;
}

type QueryResult =
  | { data: User; isLoading: false; isSuccess: true }
  | { data: undefined; isLoading: true; isSuccess: false };

export function useUser(): QueryResult {
  const auth = getAuth();
  const [state, setState] = useState<QueryResult>({
    data: undefined,
    isLoading: true,
    isSuccess: false,
  });
  React.useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({ data: user, isLoading: false, isSuccess: true });
      } else {
        setState({ data: undefined, isLoading: true, isSuccess: false });
      }
    });
  }, []);
  return state;
}

export function usePlace(placeId: string): api.Place | "loading" | "not_found" {
  const [place, setPlace] = useState<api.Place | "loading" | "not_found">(
    "loading"
  );
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "places", placeId), (doc) => {
      const place: api.Place = {
        id: doc.id,
        ...(doc.data() as Omit<api.Place, "id">),
      };
      setPlace(place);
    });
    return unsub;
  }, [placeId]);
  return place;
}

export function useMenuItems(placeId: string): api.PlaceMenuItem[] | "loading" {
  const [state, setState] = useState<api.PlaceMenuItem[] | "loading">(
    "loading"
  );
  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "places", placeId, "menuitems")),
      (doc) => {
        const docs: api.PlaceMenuItem[] = [];
        doc.forEach((doc) => {
          const d: api.PlaceMenuItem = {
            id: doc.id,
            ...(doc.data() as Omit<api.PlaceMenuItem, "id">),
          };
          docs.push(d);
        });
        setState(docs);
      }
    );
    return unsub;
  }, [placeId]);
  return state;
}
export function useMenuItem(
  placeId: string,
  menuItemId: string
): api.PlaceMenuItem | "loading" | "not_found" {
  const [state, setState] = useState<
    api.PlaceMenuItem | "loading" | "not_found"
  >("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(
      doc(collection(db, "places", placeId, "menuitems", menuItemId)),
      (doc) => {
        const d: api.PlaceMenuItem = {
          id: doc.id,
          ...(doc.data() as Omit<api.PlaceMenuItem, "id">),
        };

        setState(d);
      }
    );
    return unsub;
  }, [placeId, menuItemId]);
  return state;
}
export function useCheckins(placeId: string): api.PlaceCheckIn[] | "loading" {
  const [state, setState] = useState<api.PlaceCheckIn[] | "loading">("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "places", placeId, "checkins")),
      (doc) => {
        const docs: api.PlaceCheckIn[] = [];
        doc.forEach((doc) => {
          docs.push({
            id: doc.id,
            ...(doc.data() as Omit<api.PlaceCheckIn, "id">),
          });
        });
        setState(docs);
      }
    );
    return unsub;
  }, [placeId]);
  return state;
}

export function useCheckIn(
  placeId: string,
  checkInId: string
): api.PlaceCheckIn | "loading" | "not_found" {
  const [state, setState] = useState<
    api.PlaceCheckIn | "loading" | "not_found"
  >("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(
      doc(collection(db, "places", placeId, "checkins", checkInId)),
      (doc) => {
        const d: api.PlaceCheckIn = {
          id: doc.id,
          ...(doc.data() as Omit<api.PlaceCheckIn, "id">),
        };

        setState(d);
      }
    );
    return unsub;
  }, [placeId, checkInId]);
  return state;
}

export function usePlaces(userId: string | undefined) {
  const [places, setPlaces] = useState<api.Place[] | "loading">("loading");
  React.useEffect(() => {
    if (userId == null) {
      return;
    }
    const q = query(
      collection(db, "places"),
      where("viewerIds", "array-contains", userId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const places: api.Place[] = [];
      querySnapshot.forEach((doc) => {
        places.push({ id: doc.id, ...(doc.data() as Omit<api.Place, "id">) });
      });
      setPlaces(places);
    });
    return () => {
      unsubscribe();
    };
  }, [userId]);
  return places;
}

export function useFriends(userId: string | null) {
  type Friend = {
    accepted: boolean;
    acceptedAt: Date | null;
    createdById: string;
    id: string;
    invitedAt: Date;
  };
  const [state, setState] = useState<Friend[]>([]);
  React.useEffect(() => {
    if (!userId) {
      return;
    }
    const q = query(collection(db, `users`, userId, "friends"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const friends: Friend[] = [];
      querySnapshot.forEach((doc) => {
        friends.push({ id: doc.id, ...(doc.data() as Omit<Friend, "id">) });
      });
      setState(friends);
    });
    return () => {
      unsubscribe();
    };
  }, [userId]);
  return state;
}
