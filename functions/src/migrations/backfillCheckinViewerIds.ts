// ran with:
// ./node_modules/.bin/esbuild src/migrations/backfillCheckinViewerIds.ts --bundle --minify --sourcemap --platform=node --target=node16 --outfile=build/backfill.js && node build/backfill.js ./service-account-private-key.json

import * as admin from "firebase-admin"

const config = {
  credential: admin.credential.cert(process.argv[2]),
}

admin.initializeApp(config)

const db = admin.firestore()

async function main() {
  const queryResult = await db.collection("places").orderBy("createdAt").get()
  queryResult.forEach(async (placeDoc) => {
    // eslint-disable-next-line no-console
    console.log("place_id", placeDoc.id)
    // eslint-disable-next-line no-console
    console.log("place", placeDoc.data().name)
    const checkins = await db.collection(`places/${placeDoc.id}/checkins`).get()
    checkins.forEach(async (checkinDoc) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const placeViewerIds = placeDoc.data().viewerIds
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const viewerIds = checkinDoc.data().viewerIds
      if (viewerIds == null) {
        // eslint-disable-next-line no-console
        console.log("updating...", checkinDoc.ref.path)
        const update = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          viewerIds: placeViewerIds ?? [],
        }
        await db.doc(checkinDoc.ref.path).update(update)
        // eslint-disable-next-line no-console
        console.log("updated!", checkinDoc.ref.path)
      } else {
        // eslint-disable-next-line no-console
        console.log("skipping, has viewerIds already", checkinDoc.ref.path)
      }
    })
  })
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
})
