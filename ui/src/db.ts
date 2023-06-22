import * as Sentry from "@sentry/browser"
import { initializeApp } from "firebase/app"
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
} from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"
import { fetchAndActivate, getRemoteConfig } from "firebase/remote-config"

import { firebaseConfig } from "./config"

setLogLevel("warn")
const app = initializeApp(firebaseConfig)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

const functions = getFunctions(app)
export const remoteConfig = getRemoteConfig(app)
remoteConfig.settings.minimumFetchIntervalMillis = (60 * 60 * 1000) / 5

export const remoteConfigDefaults = {
  use_js_map: false,
} as const

export type RemoteConfigKey = keyof typeof remoteConfigDefaults

remoteConfig.defaultConfig = remoteConfigDefaults
fetchAndActivate(remoteConfig).catch((err) => {
  Sentry.captureException(err)
})

export const mergePlaceIntoPlace = httpsCallable<
  { oldPlaceId: string; targetPlaceId: string },
  unknown
>(functions, "mergePlaceIntoPlace")
