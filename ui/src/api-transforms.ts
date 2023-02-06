import { Timestamp } from "firebase/firestore"
import { countBy, orderBy, uniqBy } from "lodash-es"

import { PlaceCheckIn, PlaceMenuItem } from "./api-schemas"

type CountsByMenuItem = Record<
  PlaceMenuItem["id"],
  { positive: number; negative: number } | undefined
>

export function calculateCheckinCountsByMenuItem(
  checkins: PlaceCheckIn[],
): CountsByMenuItem {
  const checkinRatings: Record<
    PlaceMenuItem["id"],
    | { userId: string; rating: number; checkedInAt: Timestamp | null }[]
    | undefined
  > = {}
  for (const checkin of checkins) {
    for (const rating of checkin.ratings) {
      checkinRatings[rating.menuItemId] =
        checkinRatings[rating.menuItemId] || []
      checkinRatings[rating.menuItemId]?.push({
        checkedInAt: checkin.checkedInAt,
        rating: rating.rating,
        userId: checkin.createdById,
      })
    }
  }

  const ratingsPerMenuItemId: Record<
    string,
    { positive: number; negative: number }
  > = {}
  Object.entries(checkinRatings).forEach(([menuItemId, checkinRatingArr]) => {
    const ratings = uniqBy(
      orderBy(checkinRatingArr, (x) => x.checkedInAt?.toMillis() ?? 0, [
        "desc",
      ]),
      (x) => x.userId,
    ).map((x) => x.rating)
    const groupedResult = countBy(ratings, (x) => x)
    ratingsPerMenuItemId[menuItemId] = {
      positive: groupedResult["1"] ?? 0,
      negative: groupedResult["-1"] ?? 0,
    }
  })

  return ratingsPerMenuItemId
}
