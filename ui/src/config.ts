import { FirebaseOptions } from "firebase/app"

export const ENVIRONMENT =
  import.meta.env.VITE_PROJECT == null ||
  import.meta.env.VITE_PROJECT === "foodieyak-staging"
    ? "staging"
    : "production"

export const ALGOLIA_APP_ID = "UA3MF4ZCHW"
export const ALGOLIA_PLACES_SEARCH_INDEX =
  ENVIRONMENT === "staging" ? "staging_places" : "prod_places"
export const GOOGLE_MAPS_API_KEY = "AIzaSyBekpp2MYRNLvd9f0fIAEjgMmVHe32aoW0"

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

function getConfig() {
  if (ENVIRONMENT === "staging") {
    return stageFirebaseConfig
  }
  return prodFirebaseConfig
}

export const firebaseConfig = getConfig()
// eslint-disable-next-line no-console
console.log("VITE_PROJECT", import.meta.env.VITE_PROJECT)
// eslint-disable-next-line no-console
console.log("projectId", firebaseConfig.projectId)
