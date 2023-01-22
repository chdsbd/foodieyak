import { HStack } from "@chakra-ui/react"

import { Place } from "../api-schemas"
import { LocationImage } from "./LocationImage"

export function PlaceInfoPanel({ place }: { place: Place }) {
  return (
    <HStack w="100%">
      <LocationImage />
      <div>
        <div>{place.name}</div>
        <div>{place.location}</div>
      </div>
    </HStack>
  )
}
