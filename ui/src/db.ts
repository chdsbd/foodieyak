// Import the functions you need from the SDKs you need
import { FirebaseError, initializeApp } from "firebase/app"
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const prodFirebaseConfig = {
  apiKey: "AIzaSyCjtXB9vYR7qNm3EW6pLomMEVWVP4OhvtI",
  authDomain: "foodieyak-ef36d.firebaseapp.com",
  projectId: "foodieyak-ef36d",
  storageBucket: "foodieyak-ef36d.appspot.com",
  messagingSenderId: "886799226153",
  appId: "1:886799226153:web:cd7693aec808276c741338",
}

const stageFirebaseConfig = {
  apiKey: "AIzaSyANGQOnH9oQPFSfuYHKzRchXn6IedoXQlU",
  authDomain: "foodieyak-staging.firebaseapp.com",
  projectId: "foodieyak-staging",
  storageBucket: "foodieyak-staging.appspot.com",
  messagingSenderId: "227275725965",
  appId: "1:227275725965:web:7d4a3c7f08bf07c3c916c4",
}

function getEnvironment(): "staging" | "production" {
  if (
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("staging")
  ) {
    return "staging"
  }
  return "production"
}

const environment = getEnvironment()

// eslint-disable-next-line no-console
console.info(`environment: ${environment}`)

const app = initializeApp(
  getEnvironment() === "production" ? prodFirebaseConfig : stageFirebaseConfig,
)

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
