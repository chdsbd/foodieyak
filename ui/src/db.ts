import { FirebaseError, initializeApp } from "firebase/app"
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"

import { firebaseConfig } from "./config"

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
const functions = getFunctions(app)

export const mergePlaceIntoPlace = httpsCallable<
  { oldPlaceId: string; targetPlaceId: string },
  unknown
>(functions, "mergePlaceIntoPlace")

enableIndexedDbPersistence(db).catch((err: FirebaseError) => {
  // eslint-disable-next-line no-console
  console.log(err)
  if (err.code === "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a a time.
    // ...
  } else if (err.code === "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence
    // ...
  }
})
