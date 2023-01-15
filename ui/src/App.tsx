import { Container } from "@chakra-ui/react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AuthLoginView } from "./pages/AuthLoginView.page";
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

const routes = [
  {
    path: "/signup",
    element: <AuthSignupView />,
  },
  {
    path: "/login",
    element: <AuthLoginView />,
  },
  {
    path: "/place/:place/check-in/:checkin",
    element: <CheckInDetailView />,
  },
  {
    path: "/place/:place/menu/:menuitem",
    element: <MenuItemDetailView />,
  },
  {
    path: "/place/:id/check-in",
    element: <CheckInCreateView />,
  },
  {
    path: "/place/create",
    element: <PlacesCreateView />,
  },
  {
    path: "/place/:id",
    element: <PlacesDetailView />,
  },

  {
    path: "/friends/add",
    element: <FriendsCreateView />,
  },
  {
    path: "/friends",
    element: <FriendsListView />,
  },
  {
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
  return (
    <Container padding={2}>
      <Router>
        <Switch>
          {routes.map((r) => {
            return <Route path={r.path} children={r.element} exact={r.exact} />;
          })}
        </Switch>
      </Router>
    </Container>
  );
}

export default App;
