import { Box, Text } from "@chakra-ui/react"
import React from "react"

export function EmptyStateText({
  children,
  marginBottom = 0,
}: {
  children: React.ReactNode
  marginBottom?: number
}) {
  return (
    <Box w="full">
      <Text
        userSelect={"none"}
        fontSize="lg"
        textColor={"GrayText"}
        textAlign="center"
        w="full"
        marginBottom={marginBottom}
      >
        {children}
      </Text>
    </Box>
  )
}
