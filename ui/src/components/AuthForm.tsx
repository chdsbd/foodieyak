import { Heading, HStack, VStack } from "@chakra-ui/react"
import React from "react"

function AuthHeading() {
  return (
    <HStack alignItems="center" marginTop="4" marginBottom="-4">
      <Heading as="h1" size="lg" fontWeight={500}>
        FoodieYak
      </Heading>
    </HStack>
  )
}

export function AuthForm({
  onSubmit,
  children,
}: {
  onSubmit: () => void
  children: React.ReactNode
}) {
  return (
    <VStack
      spacing={4}
      marginX="auto"
      maxWidth={400}
      as="form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <AuthHeading />
      {children}
    </VStack>
  )
}
