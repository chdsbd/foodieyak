import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import React, { useState } from "react";

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
