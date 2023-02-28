import { Input } from "@chakra-ui/react"
import { Wrapper } from "@googlemaps/react-wrapper"
import { useEffect, useRef } from "react"

import { Place } from "../api-schemas"
import { GOOGLE_MAPS_API_KEY } from "../config"

type GMapsPlace = {
  name: string
  address: string
  geoInfo: Place["geoInfo"]
}

function SelectInputInner({
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
  const inputRef = useRef<HTMLInputElement>(null)

  // Avoid having the Google Maps setup code run more than once. This prevents
  // us from having onSelect as a useEffect dependency
  const handleSelect = useRef(onSelect)
  useEffect(() => {
    handleSelect.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (inputRef.current == null) {
      return
    }
    autoCompleteService.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["food"],
      },
    )
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
        handleSelect.current({
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
  }, [])
  return (
    <Input
      type="text"
      value={value}
      ref={inputRef}
      onChange={(e) => {
        onChange(e.target.value)
      }}
      isDisabled={isDisabled}
      isRequired
    />
  )
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
  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={["places", "marker"]}
      version="beta"
    >
      <SelectInputInner
        value={value}
        onSelect={onSelect}
        isDisabled={isDisabled}
        onChange={onChange}
      />
    </Wrapper>
  )
}
