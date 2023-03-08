import { Container, VStack } from "@chakra-ui/react"

import { NavBar } from "./NavBar"

export function Page({
  action,
  children,
  noCenter = false,
}: {
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
          <NavBar action={action} />
        </Container>
        {children}
      </VStack>
    )
  }
  return (
    <Container padding={2}>
      <VStack spacing={2} alignItems="start">
        <NavBar action={action} />
        {children}
      </VStack>
    </Container>
  )
}
