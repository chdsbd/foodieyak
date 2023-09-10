import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import {
  QueryClient,
  QueryClientProvider,
  useIsRestoring,
} from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { getFirestore } from "firebase/firestore"
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom"
import { FirestoreProvider, useFirebaseApp } from "reactfire"

import { ErrorBoundary } from "./components/ErrorBoundary"
import { useIsAuthed } from "./hooks"
import { ActivityView } from "./pages/ActivityView.page"
import { AuthForgotPassword } from "./pages/AuthForgotPassword"
import { AuthLoginView } from "./pages/AuthLoginView.page"
import { AuthPasswordReset } from "./pages/AuthPasswordReset.page"
import { AuthSignupView } from "./pages/AuthSignupView.page"
import { CheckInCreateView } from "./pages/CheckInCreateView/CheckInCreateView.page"
import { CheckInDetailView } from "./pages/CheckInDetailView.page"
import { CheckInEditView } from "./pages/CheckInEditView.page"
import { FriendsCreateView } from "./pages/FriendsCreateView.page"
import { FriendsListView } from "./pages/FriendsListView.page"
import { MapListView } from "./pages/MapListView.page"
import { MenuItemDetailView } from "./pages/MenuItemDetailView.page"
import { MenuItemEditView } from "./pages/MenuItemEditView.page"
import { NoMatch } from "./pages/NoMatchView.page"
import { PlacesCreateView } from "./pages/PlacesCreateView.page"
import { PlacesDetailView } from "./pages/PlacesDetailView.page"
import { PlacesEditView } from "./pages/PlacesEditView.page"
import { PlacesListView } from "./pages/PlacesListView.page"
import { SettingsView } from "./pages/SettingsView.page"
import {
  pathActivityList,
  pathCheckinCreate,
  pathCheckinDetail,
  pathCheckinEdit,
  pathFriendsCreate,
  pathFriendsList,
  pathLogin,
  pathMapList,
  pathMenuItemDetail,
  pathMenuItemEdit,
  pathPasswordForgot,
  pathPasswordReset,
  pathPlaceCreate,
  pathPlaceDetail,
  pathPlaceEdit,
  pathPlaceList,
  pathPlaceListDeprecated,
  pathSettingsDetail,
  pathSignup,
} from "./paths"

const routes: (
  | { path: string; authed?: true; exact?: true; element: JSX.Element }
  | { path: string; redirect: string }
)[] = [
  {
    path: pathSignup.pattern,
    element: <AuthSignupView />,
  },
  {
    path: pathLogin.pattern,
    element: <AuthLoginView />,
  },
  {
    path: pathPasswordReset.pattern,
    element: <AuthPasswordReset />,
  },
  {
    path: pathPasswordForgot.pattern,
    element: <AuthForgotPassword />,
  },
  {
    authed: true,
    path: pathCheckinEdit.pattern,
    element: <CheckInEditView />,
  },
  {
    authed: true,
    path: pathCheckinDetail.pattern,
    element: <CheckInDetailView />,
  },
  {
    authed: true,
    path: pathMapList.pattern,
    element: <MapListView />,
  },
  {
    authed: true,
    path: pathActivityList.pattern,
    element: <ActivityView />,
  },
  {
    authed: true,
    path: pathMenuItemEdit.pattern,
    element: <MenuItemEditView />,
  },
  {
    authed: true,
    path: pathMenuItemDetail.pattern,
    element: <MenuItemDetailView />,
  },
  {
    authed: true,
    path: pathCheckinCreate.pattern,
    element: <CheckInCreateView />,
  },
  {
    authed: true,
    path: pathPlaceCreate.pattern,
    element: <PlacesCreateView />,
  },
  {
    authed: true,
    path: pathPlaceEdit.pattern,
    element: <PlacesEditView />,
  },
  {
    authed: true,
    path: pathPlaceDetail.pattern,
    element: <PlacesDetailView />,
  },
  {
    authed: true,
    path: pathPlaceListDeprecated.pattern,
    redirect: pathPlaceCreate({}),
  },
  {
    authed: true,
    path: pathFriendsCreate.pattern,
    element: <FriendsCreateView />,
  },
  {
    authed: true,
    path: pathFriendsList.pattern,
    element: <FriendsListView />,
  },
  {
    authed: true,
    path: pathSettingsDetail.pattern,
    element: <SettingsView />,
  },
  {
    authed: true,
    path: pathPlaceList.pattern,
    exact: true,
    element: <PlacesListView />,
  },
  {
    path: "*",
    element: <NoMatch />,
  },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
})
const persister = createSyncStoragePersister({
  storage: localStorage,
  retry: ({ error }) => {
    // eslint-disable-next-line no-console
    console.error("problem persisting")
    // eslint-disable-next-line no-console
    console.error(error)
    return undefined
  },
})

function RestoreWaiter({ children }: { children: React.ReactNode }) {
  const isRestoring = useIsRestoring()
  if (isRestoring) {
    // NOTE: we don't render the site until react-query finishes hydrating from cache
    // some sites like linear show a loader, but they must guarentee it shows
    // for $N milliseconds or something because when it's really quick, < $N
    // milliseconds it looks like a glitchy flash
    return null
  }
  return <>{children}</>
}

function App() {
  const firestoreInstance = getFirestore(useFirebaseApp())
  const authStatus = useIsAuthed()

  if (authStatus === "loading") {
    // don't have auth data so we dont' know what to show
    return null
  }
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          // NOTE: Ideally we'd only bust the cache when the cache schema changes
          // in a backwards incompatible way but calculating that is annoying so
          // just break it on every deploy
          // buster: GIT_SHA,
          persister,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        }}
      >
        <FirestoreProvider sdk={firestoreInstance}>
          <RestoreWaiter>
            <Router>
              <Switch>
                {routes.map((r) => {
                  if ("redirect" in r) {
                    return (
                      <Redirect key={r.path} from={r.path} to={r.redirect} />
                    )
                  }
                  if (r.authed === true && authStatus === "unauthed") {
                    return <Redirect key={r.path} to={pathLogin({})} />
                  }
                  return (
                    <Route
                      key={r.path}
                      path={r.path}
                      children={r.element}
                      exact={r.exact}
                    />
                  )
                })}
              </Switch>
            </Router>
          </RestoreWaiter>
        </FirestoreProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
