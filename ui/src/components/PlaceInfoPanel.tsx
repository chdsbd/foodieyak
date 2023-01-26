import { Heading, Text } from "@chakra-ui/react"

import { Place } from "../api-schemas"

export function PlaceInfoPanel({ place }: { place: Place }) {
  return (
    <div>
      <Heading as="h1" size="lg">
        {place.name}
      </Heading>
      <Text fontWeight={"bold"}>{place.location}</Text>
    </div>
  )
}
