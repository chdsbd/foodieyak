import { initializeApp } from "firebase/app"
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
} from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"

import { firebaseConfig } from "./config"

setLogLevel("warn")
const app = initializeApp(firebaseConfig)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

const functions = getFunctions(app)

export const remoteConfigDefaults = {
  use_js_map: false,
} as const

export type RemoteConfigKey = keyof typeof remoteConfigDefaults

export const mergePlaceIntoPlace = httpsCallable<
  { oldPlaceId: string; targetPlaceId: string },
  unknown
>(functions, "mergePlaceIntoPlace")
