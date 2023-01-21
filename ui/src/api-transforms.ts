import { countBy, orderBy, uniqBy } from "lodash-es";
import { PlaceCheckIn, PlaceMenuItem } from "./api";

type CountsByMenuItem = Record<
  PlaceMenuItem["id"],
  { positive: number; negative: number } | undefined
>;

export function calculateCheckinCountsByMenuItem(
  checkins: PlaceCheckIn[]
): CountsByMenuItem {
  const checkinRatings: Record<
    PlaceMenuItem["id"],
    { userId: string; rating: number; createdAt: string }[] | undefined
  > = {};
  for (const checkin of checkins) {
    for (const rating of checkin.ratings) {
      checkinRatings[rating.menuItemId] =
        checkinRatings[rating.menuItemId] || [];
      checkinRatings[rating.menuItemId]?.push({
        createdAt: checkin.createdAt,
        rating: rating.rating,
        userId: checkin.userId,
      });
    }
  }

  const ratingsPerMenuItemId: Record<
    string,
    { positive: number; negative: number }
  > = {};
  Object.entries(checkinRatings).forEach(([entry, checkinRatingArr]) => {
    const ratings = uniqBy(
      orderBy(checkinRatingArr, (x) => x.createdAt, ["desc"]),
      (x) => x.userId
    ).map((x) => x.rating);
    const groupedResult = countBy(ratings, (x) => x);
    ratingsPerMenuItemId[entry] = {
      positive: groupedResult["1"],
      negative: groupedResult["-1"],
    };
  });

  return ratingsPerMenuItemId;
}
