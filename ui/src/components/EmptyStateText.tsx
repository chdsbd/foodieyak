import { Box, Text } from "@chakra-ui/react"
import React from "react"

export function EmptyStateText({ children }: { children: React.ReactNode }) {
  return (
    <Box w="full">
      <Text
        fontSize="xl"
        textColor={"GrayText"}
        textAlign="center"
        w="full"
        marginBottom={4}
      >
        {children}
      </Text>
    </Box>
  )
}
