import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import React, { useState } from "react";
import * as query from "./query";

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
): query.Place | "loading" | "not_found" {
  const [place, setPlace] = useState<query.Place | "loading" | "not_found">(
    "loading"
  );
  React.useEffect(() => {
    query.placeGet({ id: placeId }).then((res) => {
      if (res != null) {
        setPlace(res);
      } else {
        setPlace("not_found");
      }
    });
  }, [placeId]);
  return place;
}

export function usePlaces() {
  const [places, setPlaces] = useState<query.Place[]>([]);
  React.useEffect(() => {
    query.placeList().then((x) => {
      setPlaces(x);
    });
  }, []);
  return places;
}

export function useInvites(userId: string) {
  const [state, setState] = useState<query.UserInvite[]>([]);
  React.useEffect(() => {
    query.invitesList({ userId }).then((x) => {
      setState(x);
    });
  }, [userId]);
  return state;
}
export function useFriends(userId: string) {
  const [state, setState] = useState<query.User[]>([]);
  React.useEffect(() => {
    query.friendsList({ userId }).then((x) => {
      setState(x);
    });
  }, [userId]);
  return state;
}
