// Import the functions you need from the SDKs you need
import { FirebaseError, FirebaseOptions, initializeApp } from "firebase/app"
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const prodFirebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCjtXB9vYR7qNm3EW6pLomMEVWVP4OhvtI",
  authDomain: "foodieyak-ef36d.firebaseapp.com",
  projectId: "foodieyak-ef36d",
  storageBucket: "foodieyak-ef36d.appspot.com",
  messagingSenderId: "886799226153",
  appId: "1:886799226153:web:cd7693aec808276c741338",
}

const stageFirebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyANGQOnH9oQPFSfuYHKzRchXn6IedoXQlU",
  authDomain: "foodieyak-staging.firebaseapp.com",
  projectId: "foodieyak-staging",
  storageBucket: "foodieyak-staging.appspot.com",
  messagingSenderId: "227275725965",
  appId: "1:227275725965:web:7d4a3c7f08bf07c3c916c4",
}

export const ENVIRONMENT =
  import.meta.env.VITE_PROJECT == null ||
  import.meta.env.VITE_PROJECT === "foodieyak-staging"
    ? "staging"
    : "production"

function getConfig() {
  if (ENVIRONMENT === "staging") {
    return stageFirebaseConfig
  }
  return prodFirebaseConfig
}

export const config = getConfig()

const app = initializeApp(config)
// eslint-disable-next-line no-console
console.log("VITE_PROJECT", import.meta.env.VITE_PROJECT)
// eslint-disable-next-line no-console
console.log("projectId", config.projectId)

export const db = getFirestore(app)

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
