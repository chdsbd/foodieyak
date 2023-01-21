import { VStack } from "@chakra-ui/react"

import { NavBar } from "./NavBar"

export function Page({
  action,
  children,
}: {
  children: React.ReactNode
  action?: JSX.Element
}) {
  return (
    <VStack spacing={4} alignItems="start">
      <NavBar action={action} />
      {children}
    </VStack>
  )
}
