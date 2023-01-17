import { flatten, groupBy, orderBy, uniqBy } from "lodash-es";
import { Place } from "./fakeDb";

// TODO: Fix this broken code.
export function menuFromPlace(
  place: Place,
  currentUserId: string
): {
  menuItemId: string;
  menuItemName: string;
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

  const ratingsByMenuItemId = groupBy(
    menuItemRatingsWithUserId,
    (z) => z.menuItemId
  );
  return place.menuItems.map((x) => ({
    menuItemId: x.id,
    menuItemName: x.name,
    negativeCount: (ratingsByMenuItemId[x.id] ?? []).filter((y) => y.rating < 0)
      .length,
    positiveCount: (ratingsByMenuItemId[x.id] ?? []).filter((y) => y.rating > 0)
      .length,
    selfRating:
      (ratingsByMenuItemId[x.id] ?? []).find((y) => y.userId === currentUserId)
        ?.rating ?? null,
  }));
}
