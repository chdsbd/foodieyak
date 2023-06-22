import { Container, VStack } from "@chakra-ui/react"
import { Helmet } from "react-helmet"

import { NavBar } from "./NavBar"

export function Page({
  title,
  action,
  children,
  noCenter = false,
}: {
  title?: string
  children: React.ReactNode
  action?: JSX.Element
  noCenter?: boolean
}) {
  if (noCenter) {
    return (
      <VStack
        spacing={2}
        alignItems="start"
        height={window.innerWidth < 500 ? "-webkit-fill-available" : "100vh"}
        display={"flex"}
        flexDirection={"column"}
      >
        <Container padding={2}>
          {title != null && (
            <Helmet>
              <title>{title} — FoodieYak</title>
            </Helmet>
          )}
          <NavBar action={action} />
        </Container>
        {children}
      </VStack>
    )
  }
  return (
    <Container padding={2}>
      <VStack spacing={2} alignItems="start">
        {title != null && (
          <Helmet>
            <title>{title} — FoodieYak</title>
          </Helmet>
        )}
        <NavBar action={action} />
        {children}
      </VStack>
    </Container>
  )
}
