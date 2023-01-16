import { Container } from "@chakra-ui/react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useIsAuthed } from "./hooks";
import { AuthForgotPassword } from "./pages/AuthForgotPassword";
import { AuthLoginView } from "./pages/AuthLoginView.page";
import { AuthPasswordReset } from "./pages/AuthPasswordReset.page";
import { AuthSignupView } from "./pages/AuthSignupView.page";
import { CheckInCreateView } from "./pages/CheckInCreateView.page";
import { CheckInDetailView } from "./pages/CheckInDetailView.page";
import { FriendsCreateView } from "./pages/FriendsCreateView.page";
import { FriendsListView } from "./pages/FriendsListView.page";
import { MenuItemDetailView } from "./pages/MenuItemDetailView.page";
import { NoMatch } from "./pages/NoMatchView.page";
import { PlacesCreateView } from "./pages/PlacesCreateView.page";
import { PlacesDetailView } from "./pages/PlacesDetailView.page";
import { PlacesListView } from "./pages/PlacesListView.page";
import { SettingsView } from "./pages/SettingsView.page";

const routes = [
  {
    path: "/signup",
    authed: "never",
    element: <AuthSignupView />,
  },
  {
    path: "/login",
    authed: "never",
    element: <AuthLoginView />,
  },
  {
    path: "/password-reset",
    authed: "never",
    element: <AuthPasswordReset />,
  },
  {
    path: "/forgot-password",
    authed: "never",
    element: <AuthForgotPassword />,
  },
  {
    authed: true,
    path: "/place/:place/check-in/:checkin",
    element: <CheckInDetailView />,
  },
  {
    authed: true,
    path: "/place/:place/menu/:menuitem",
    element: <MenuItemDetailView />,
  },
  {
    authed: true,
    path: "/place/:id/check-in",
    element: <CheckInCreateView />,
  },
  {
    authed: true,
    path: "/place/create",
    element: <PlacesCreateView />,
  },
  {
    authed: true,
    path: "/place/:id",
    element: <PlacesDetailView />,
  },

  {
    authed: true,
    path: "/friends/add",
    element: <FriendsCreateView />,
  },
  {
    authed: true,
    path: "/friends",
    element: <FriendsListView />,
  },
  {
    authed: true,
    path: "/settings",
    element: <SettingsView />,
  },
  {
    authed: true,
    path: "/",
    exact: true,
    element: <PlacesListView />,
  },
  {
    path: "*",
    element: <NoMatch />,
  },
];

function App() {
  const authStatus = useIsAuthed();
  return (
    <Container padding={2}>
      <Router>
        <Switch>
          {routes.map((r) => {
            if (r.authed == true && authStatus === "unauthed") {
              return <Redirect key={r.path} to="/login" />;
            }
            return (
              <Route
                key={r.path}
                path={r.path}
                children={r.element}
                exact={r.exact}
              />
            );
          })}
        </Switch>
      </Router>
    </Container>
  );
}

export default App;
