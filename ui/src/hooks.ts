import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useState } from "react";

export function useIsAuthed(): "authed" | "unauthed" | "loading" {
  const auth = getAuth();
  const [state, setState] = useState<"authed" | "unauthed" | "loading">(
    "loading"
  );
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setState("authed");
    } else {
      setState("unauthed");
    }
  });
  return state;
}
