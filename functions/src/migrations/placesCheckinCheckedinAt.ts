// ran with:
// ./node_modules/.bin/esbuild src/migration.ts --bundle --minify --sourcemap --platform=node --target=node16 --outfile=build/migration.js && node build/migration.js

import * as admin from "firebase-admin"

const config = {
  apiKey: "AIzaSyCjtXB9vYR7qNm3EW6pLomMEVWVP4OhvtI",
  authDomain: "foodieyak-ef36d.firebaseapp.com",
  projectId: "foodieyak-ef36d",
  storageBucket: "foodieyak-ef36d.appspot.com",
  messagingSenderId: "886799226153",
  appId: "1:886799226153:web:cd7693aec808276c741338",
  credential: admin.credential.cert(
    "foodieyak-ef36d-firebase-adminsdk-w1maf-6957d2f008.json",
  ),
}

admin.initializeApp(config)

const db = admin.firestore()

async function main() {
  const queryResult = await db.collection("places").orderBy("createdAt").get()
  queryResult.forEach(async (placeDoc) => {
    console.log("place_id", placeDoc.id)
    console.log("place", placeDoc.data().name)
    const checkins = await db.collection(`places/${placeDoc.id}/checkins`).get()
    checkins.forEach(async (checkinDoc) => {
      const createdAt = checkinDoc.data().createdAt
      const checkedInAt = checkinDoc.data().checkedInAt
      if (checkedInAt == null) {
        console.log("updating...", checkinDoc.ref.path)
        const update = {
          checkedInAt: createdAt,
        }
        await db.doc(checkinDoc.ref.path).update(update)
        console.log("updated!", checkinDoc.ref.path)
      }
    })
  })
}

main().catch((e) => { console.error(e); })
