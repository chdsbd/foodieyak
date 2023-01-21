import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  // TODO: move to env var
  dsn: "https://a2e76d2f6b1c435897d9018b9f332cf5@o64108.ingest.sentry.io/4504528386916352",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  beforeSend: (event) => {
    console.error(event.event_id, event.exception?.values?.[0].value);
    return event;
  },
});

// todo: rework how we initialize this
import { db } from "./db";

console.log(db.app.name);

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
