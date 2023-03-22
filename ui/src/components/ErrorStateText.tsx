import { Box, Text, VStack } from "@chakra-ui/react"

export function ErrorStateText({ children }: { children: React.ReactNode }) {
  return (
    <Box w="full" justifyContent={"center"} display="flex">
      <VStack align="start" spacing={0}>
        <Text userSelect={"none"} fontSize="lg" fontWeight={"bold"}>
          Error
        </Text>
        <Text userSelect={"none"} fontSize="md">
          {children}
        </Text>
      </VStack>
    </Box>
  )
}
