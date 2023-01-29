import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import * as Sentry from "@sentry/browser"
import { BrowserTracing } from "@sentry/tracing"
import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
// todo: rework how we initialize this
import { db } from "./db"

Sentry.init({
  // TODO: move to env var
  dsn: "https://a2e76d2f6b1c435897d9018b9f332cf5@o64108.ingest.sentry.io/4504528386916352",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  beforeSend: (event, hint) => {
    // eslint-disable-next-line no-console
    console.error(
      event.event_id,
      hint.originalException || hint.syntheticException,
    )
    return event
  },
})

// eslint-disable-next-line no-console
console.log(db.app.name)

const theme = extendTheme()

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
