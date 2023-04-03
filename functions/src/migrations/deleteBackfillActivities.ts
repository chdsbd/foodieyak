/* eslint-disable no-console */
// ran with:
// ./node_modules/.bin/esbuild src/migrations/backfillCheckins.ts --bundle --minify --sourcemap --platform=node --target=node16 --outfile=build/activityBackfill.js && node build/activityBackfill.js

import * as admin from "firebase-admin"

const config = {
  credential: admin.credential.cert(
    "foodieyak-ef36d-firebase-adminsdk-mqdva-7ce20a8f6a.json",
  ),
}

admin.initializeApp(config)

const db = admin.firestore()

async function migrate() {
  const activities = await db
    .collection("activities")
    .where("document", "==", "checkin")
    .where("type", "==", "create")
    .get()

  // eslint-disable-next-line no-console
  console.log("update activities...")
  await Promise.all(
    activities.docs.map(async (activity) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const checkinId = activity.data().checkinId
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const placeId = activity.data().placeId
      const checkin = await db
        .doc(`/places/${placeId}/checkins/${checkinId}`)
        .get()
      if (checkin.exists) {
        if (checkin.data()?.checkedInAt == null) {
          console.log("checkin missing createdAt, deleting...")
          await activity.ref.delete()
        } else {
          console.log("checkin has createdAt, skipping")
        }
      }
    }),
  )
}

async function main() {
  await migrate()
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
})
