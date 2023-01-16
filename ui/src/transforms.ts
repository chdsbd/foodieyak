import { flatten, groupBy, orderBy, uniqBy } from "lodash-es";
import { Place } from "./query";

export function menuFromPlace(
  place: Place,
  currentUserId: string
): {
  id: string;
  name: string;
  selfRating: 1 | -1 | null;
  positiveCount: number;
  negativeCount: number;
}[] {
  const menuItemRatingsWithUserId = orderBy(
    flatten(
      place.checkIns.map((c) =>
        c.ratings.map((r) => ({
          ...r,
          userId: c.userId,
          createdAt: c.createdAt,
        }))
      )
    ),
    (x) => x.createdAt,
    ["desc"]
  );
  const latestRatingPerUser = uniqBy(
    menuItemRatingsWithUserId,
    (u) => u.userId + ":" + u.menuItemId
  );
  const ratingsByMenuItemId = groupBy(latestRatingPerUser, (z) => z.menuItemId);
  return place.menuItems.map((x) => ({
    id: x.id,
    name: x.name,
    negativeCount: (ratingsByMenuItemId[x.id] ?? []).filter((y) => y.rating < 0)
      .length,
    positiveCount: (ratingsByMenuItemId[x.id] ?? []).filter((y) => y.rating > 0)
      .length,
    selfRating:
      (ratingsByMenuItemId[x.id] ?? []).find((y) => y.userId === currentUserId)
        ?.rating ?? null,
  }));
}
