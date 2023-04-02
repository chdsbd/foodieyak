// ran with:
// ./node_modules/.bin/esbuild src/migrations/backfillCheckins.ts --bundle --minify --sourcemap --platform=node --target=node16 --outfile=build/activityBackfill.js && node build/activityBackfill.js

import * as admin from "firebase-admin"

const config = {
  credential: admin.credential.cert(
    "foodieyak-ef36d-firebase-adminsdk-mqdva-1a95a419bf.json",
  ),
}

admin.initializeApp(config)

const db = admin.firestore()

async function backfillPlacesAndCheckinsAndMenuitems() {
  const activities = await db
    .collection("activities")
    .where("document", "==", "checkin")
    .where("type", "==", "create")
    .get()

  // eslint-disable-next-line no-console
  console.log("update activities...")
  await Promise.all(
    activities.docs.map(async (activity) => {
      await activity.ref.update({
        deleted: false,
      })
    }),
  )

  // eslint-disable-next-line no-console
  console.log("update checkins...")
  await Promise.all(
    activities.docs.map(async (activity) => {
      await activity.ref.update({
        deleted: false,
      })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const checkinId = activity.data().checkinId
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const placeId = activity.data().placeId
      if (
        (await db.doc(`/places/${placeId}/checkins/${checkinId}`).get()).exists
      ) {
        await db
          .doc(`/places/${placeId}/checkins/${checkinId}`)
          .update({ activityId: activity.id })
      } else {
        // eslint-disable-next-line no-console
        console.log("checkin deleted", activity.id, checkinId)
        await activity.ref.update({
          deleted: true,
        })
      }
    }),
  )
}

async function main() {
  await backfillPlacesAndCheckinsAndMenuitems()
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
})
