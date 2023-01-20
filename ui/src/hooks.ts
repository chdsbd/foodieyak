import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import React, { useState } from "react";
import * as localQuery from "./fakeDb";
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
  const [place, setPlace] = useState<
    localQuery.Place | "loading" | "not_found"
  >("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "places", placeId), (doc) => {
      setPlace({ id: doc.id, ...doc.data() });
    });
    return unsub;
  }, [placeId]);
  return place;
}

export function useMenuItems(
  placeId: string
): api.PlaceMenuItem[] | "loading" | "not_found" {
  const [state, setState] = useState<
    api.PlaceMenuItem | "loading" | "not_found"
  >("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "places", placeId, "menuitems")),
      (doc) => {
        const docs = [];
        doc.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setState(docs);
      }
    );
    return unsub;
  }, [placeId]);
  return state;
}
export function useCheckins(
  placeId: string
): api.PlaceCheckIn[] | "loading" | "not_found" {
  const [state, setState] = useState<
    api.PlaceMenuItem | "loading" | "not_found"
  >("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "places", placeId, "checkins")),
      (doc) => {
        const docs = [];
        doc.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setState(docs);
      }
    );
    return unsub;
  }, [placeId]);
  return state;
}

export function usePlaces(userId: string | undefined) {
  const [places, setPlaces] = useState<localQuery.Place[] | "loading">(
    "loading"
  );
  React.useEffect(() => {
    if (userId == null) {
      return;
    }
    const q = query(
      collection(db, "places"),
      where("viewerIds", "array-contains", userId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const places = [];
      querySnapshot.forEach((doc) => {
        places.push({ id: doc.id, ...doc.data() });
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
  const [state, setState] = useState<
    {
      accepted: boolean;

      acceptedAt: Date | null;

      createdById: string;

      id: string;

      invitedAt: Date;
    }[]
  >([]);
  React.useEffect(() => {
    if (!userId) {
      return;
    }
    const q = query(collection(db, `users`, userId, "friends"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const friends = [];
      querySnapshot.forEach((doc) => {
        friends.push({ id: doc.id, ...doc.data() });
      });
      setState(friends);
    });
    return () => {
      unsubscribe();
    };
  }, [userId]);
  return state;
}
