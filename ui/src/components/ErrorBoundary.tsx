import { Button, Heading, HStack, Link, VStack } from "@chakra-ui/react"
import * as Sentry from "@sentry/browser"
import { Component } from "react"

import { pathPlaceList } from "../paths"

const ErrorReportButton = () => (
  <Button
    onClick={() => {
      Sentry.showReportDialog()
    }}
  >
    Submit error report
  </Button>
)

export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  {
    readonly error: null | Error
  }
> {
  state = {
    error: null,
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error })
    Sentry.captureException(error, { extra: { errorInfo } })
  }
  render() {
    const errorReported = Sentry.lastEventId() != null
    if (this.state.error) {
      return (
        <HStack>
          <VStack alignItems="flex-start" mt="24" mx="auto">
            <Heading>Something went wrong</Heading>
            <div>
              Try to navigate{" "}
              <Link href={pathPlaceList({})} textDecoration="underline">
                home
              </Link>
              .
            </div>
            {errorReported && <ErrorReportButton />}
          </VStack>
        </HStack>
      )
    }
    return this.props.children
  }
}
