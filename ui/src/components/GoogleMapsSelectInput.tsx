import { Input } from "@chakra-ui/react"
import { Wrapper } from "@googlemaps/react-wrapper"
import { useCallback, useEffect, useRef } from "react"

import { Place } from "../api-schemas"
import { GOOGLE_MAPS_API_KEY } from "../config"

type GMapsPlace = {
  name: string
  address: string
  geoInfo: Place["geoInfo"]
}

export function GoogleMapsSelectInput({
  value,
  onChange,
  onSelect,
  isDisabled,
}: {
  value: string
  onChange: (_: string) => void
  isDisabled: boolean
  onSelect: (_: GMapsPlace | null) => void
}) {
  const autoCompleteService = useRef<google.maps.places.Autocomplete>()
  const autoCompleteCallback = useCallback((node: HTMLInputElement | null) => {
    if (node !== null) {
      const service = new google.maps.places.Autocomplete(node, {
        types: ["food"],
      })
      autoCompleteService.current = service
    }
  }, [])

  useEffect(() => {
    const service = autoCompleteService.current
    const eventListener = service?.addListener("place_changed", () => {
      const place = service.getPlace()
      const latLng = place.geometry?.location?.toJSON()
      if (
        place.name != null &&
        place.formatted_address != null &&
        place.place_id != null &&
        latLng != null
      ) {
        onSelect({
          name: place.name,
          address: place.formatted_address,
          geoInfo: {
            latitude: latLng.lat,
            longitude: latLng.lng,
            googlePlaceId: place.place_id,
          },
        })
      }
    })
    return () => {
      // cleanup the search input
      // https://stackoverflow.com/a/33587253/3720597
      eventListener?.remove()
      document.querySelectorAll(".pac-container").forEach((x) => {
        x.remove()
      })
    }
  }, [onSelect])

  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={["places", "marker"]}
      version="beta"
    >
      <Input
        type="text"
        value={value}
        ref={autoCompleteCallback}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        isDisabled={isDisabled}
        isRequired
      />
    </Wrapper>
  )
}
