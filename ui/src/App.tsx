import { Container } from "@chakra-ui/react"
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom"

import { ErrorBoundary } from "./components/ErrorBoundary"
import { useIsAuthed } from "./hooks"
import { AuthForgotPassword } from "./pages/AuthForgotPassword"
import { AuthLoginView } from "./pages/AuthLoginView.page"
import { AuthPasswordReset } from "./pages/AuthPasswordReset.page"
import { AuthSignupView } from "./pages/AuthSignupView.page"
import { CheckInCreateView } from "./pages/CheckInCreateView/CheckInCreateView.page"
import { CheckInDetailView } from "./pages/CheckInDetailView.page"
import { CheckInEditView } from "./pages/CheckInEditView.page"
import { FriendsCreateView } from "./pages/FriendsCreateView.page"
import { FriendsListView } from "./pages/FriendsListView.page"
import { MenuItemDetailView } from "./pages/MenuItemDetailView.page"
import { NoMatch } from "./pages/NoMatchView.page"
import { PlacesCreateView } from "./pages/PlacesCreateView.page"
import { PlacesDetailView } from "./pages/PlacesDetailView.page"
import { PlacesEditView } from "./pages/PlacesEditView.page"
import { PlacesListView } from "./pages/PlacesListView.page"
import { SettingsView } from "./pages/SettingsView.page"
import {
  pathCheckinCreate,
  pathCheckinDetail,
  pathCheckinEdit,
  pathFriendsCreate,
  pathFriendsList,
  pathLogin,
  pathMenuItemDetail,
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

function App() {
  const authStatus = useIsAuthed()
  if (authStatus === "loading") {
    // don't have auth data so we dont' know what to show
    return null
  }
  return (
    <ErrorBoundary>
      <Container padding={2}>
        <Router>
          <Switch>
            {routes.map((r) => {
              if ("redirect" in r) {
                return <Redirect key={r.path} from={r.path} to={r.redirect} />
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
      </Container>
    </ErrorBoundary>
  )
}

export default App
