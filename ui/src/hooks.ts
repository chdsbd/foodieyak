import * as Sentry from "@sentry/browser";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { collection, doc,onSnapshot, query, where } from "firebase/firestore";
import React, { useState } from "react";

import {
  Friend,
  FriendSchema,
  Place,
  PlaceCheckIn,
  PlaceCheckInSchema,
  PlaceMenuItem,
  PlaceMenuItemSchema,
  PlaceSchema,
} from "./api-schemas";
import { db } from "./db";

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

export function usePlace(placeId: string): Place | "loading" | "not_found" {
  const [place, setPlace] = useState<Place | "loading" | "not_found">(
    "loading"
  );
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "places", placeId), (doc) => {
      const place = PlaceSchema.parse({
        id: doc.id,
        ...doc.data(),
      });
      setPlace(place);
    });
    return unsub;
  }, [placeId]);
  return place;
}

export function useMenuItems(placeId: string): PlaceMenuItem[] | "loading" {
  const [state, setState] = useState<PlaceMenuItem[] | "loading">("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "places", placeId, "menuitems")),
      (doc) => {
        const docs: PlaceMenuItem[] = [];
        doc.forEach((doc) => {
          const d = PlaceMenuItemSchema.parse({
            id: doc.id,
            ...doc.data(),
          });
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
): PlaceMenuItem | "loading" | "not_found" {
  const [state, setState] = useState<PlaceMenuItem | "loading" | "not_found">(
    "loading"
  );
  React.useEffect(() => {
    const unsub = onSnapshot(
      doc(collection(db, "places", placeId, "menuitems", menuItemId)),
      (doc) => {
        const d = PlaceMenuItemSchema.parse({
          id: doc.id,
          ...doc.data(),
        });

        setState(d);
      }
    );
    return unsub;
  }, [placeId, menuItemId]);
  return state;
}
export function useCheckins(placeId: string): PlaceCheckIn[] | "loading" {
  const [state, setState] = useState<PlaceCheckIn[] | "loading">("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "places", placeId, "checkins")),
      (doc) => {
        const docs: PlaceCheckIn[] = [];
        doc.forEach((doc) => {
          docs.push(
            PlaceCheckInSchema.parse({
              id: doc.id,
              ...doc.data(),
            })
          );
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
): PlaceCheckIn | "loading" | "not_found" {
  const [state, setState] = useState<PlaceCheckIn | "loading" | "not_found">(
    "loading"
  );
  React.useEffect(() => {
    const unsub = onSnapshot(
      doc(collection(db, "places", placeId, "checkins", checkInId)),
      (doc) => {
        const d = PlaceCheckInSchema.parse({
          id: doc.id,
          ...doc.data(),
        });

        setState(d);
      }
    );
    return unsub;
  }, [placeId, checkInId]);
  return state;
}

export function usePlaces(userId: string | undefined) {
  const [places, setPlaces] = useState<Place[] | "loading">("loading");
  React.useEffect(() => {
    if (userId == null) {
      return;
    }
    const q = query(
      collection(db, "places"),
      where("viewerIds", "array-contains", userId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const places: Place[] = [];

      querySnapshot.forEach((doc) => {
        places.push(PlaceSchema.parse({ id: doc.id, ...doc.data() }));
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
  const [state, setState] = useState<Friend[] | "loading">("loading");
  React.useEffect(() => {
    if (!userId) {
      return;
    }
    const q = query(collection(db, `users`, userId, "friends"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const friends: Friend[] = [];
      querySnapshot.forEach((doc) => {
        const r = FriendSchema.safeParse({ id: doc.id, ...doc.data() });
        if (!r.success) {
          console.log(
            "FriendSchema",
            r.error.cause,
            r.error.message,
            r.error,
            doc.data()
          );

          Sentry.captureException(r.error, {
            extra: {
              schemaErrors: r.error.flatten(),
            },
            fingerprint: ["zod.schema.parse", "FriendSchema"],
          });
        } else {
          friends.push(r.data);
        }
      });
      setState(friends);
    });
    return () => {
      unsubscribe();
    };
  }, [userId]);
  return state;
}
