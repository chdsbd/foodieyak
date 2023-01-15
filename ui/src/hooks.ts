import type { User } from "./query";
export function useCurrentUser(): User {
  return { id: "j.doe", email: "j.doe@example.com", friends: [] };
}
