import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import React, { useState } from "react";
import * as localQuery from "./query";
import { db } from "./db";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";

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

export function usePlace(
  placeId: string
): localQuery.Place | "loading" | "not_found" {
  const [place, setPlace] = useState<
    localQuery.Place | "loading" | "not_found"
  >("loading");
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "places", placeId), (doc) => {
      console.log("Current data: ", doc.data());
      setPlace(doc.data());
    });
    return unsub;
  }, [placeId]);
  return place;
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
      where("createdByUserId", "==", userId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cities = [];
      querySnapshot.forEach((doc) => {
        cities.push({ id: doc.id, ...doc.data() });
      });
      console.log("Current cities in CA: ", cities);
      setPlaces(cities);
    });
    return () => {
      unsubscribe();
    };
  }, [userId]);
  return places;
}

export function useInvites(userId: string) {
  const [state, setState] = useState<localQuery.UserInvite[]>([]);
  React.useEffect(() => {
    localQuery.invitesList({ userId }).then((x) => {
      setState(x);
    });
  }, [userId]);
  return state;
}
export function useFriends(userId: string) {
  const [state, setState] = useState<localQuery.User[]>([]);
  React.useEffect(() => {
    localQuery.friendsList({ userId }).then((x) => {
      setState(x);
    });
  }, [userId]);
  return state;
}
