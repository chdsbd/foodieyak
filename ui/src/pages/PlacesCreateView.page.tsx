import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { Wrapper } from "@googlemaps/react-wrapper"
import { FirebaseError } from "firebase/app"
import { useCallback, useEffect, useRef, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"

import * as api from "../api"
import { Place } from "../api-schemas"
import { Page } from "../components/Page"
import { GOOGLE_MAPS_API_KEY } from "../config"
import { useFriends, useUser } from "../hooks"
import { pathPlaceDetail } from "../paths"

function InternalLocationImage({
  markerLocation,
  variant = "color",
  geoInfo,
}: {
  markerLocation: string
  variant: "gray" | "color"
  geoInfo: NonNullable<Place["geoInfo"]>
}) {
  // We adjust the width of the image to fit the anchor element.
  //
  // We use object-fit: cover to ensure the image looks okay even if the size is off.
  // By using the exact size, Google Maps will render a better looking image that has points of interest correctly fitted in the image.
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }
    const latLng = { lat: geoInfo.latitude, lng: geoInfo.longitude }
    const map = new window.google.maps.Map(ref.current, {
      center: latLng,
      zoom: 14,
      mapId: variant === "gray" ? "5b431cb5aca0f386" : "a7ace313e8de6a37",
      clickableIcons: false,
      disableDefaultUI: true,
      draggableCursor: "pointer",
      gestureHandling: "none",

      keyboardShortcuts: false,
    })
    const pinViewGlyph = new google.maps.marker.PinView({
      glyphColor: "#4C4C4C",
      borderColor: "#4C4C4C",
      background: "#666666",
    })
    new window.google.maps.marker.AdvancedMarkerView({
      map,
      content: pinViewGlyph.element,
      position: latLng,
    })
  })

  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    markerLocation,
  )}&query_place_id=${encodeURIComponent(geoInfo.googlePlaceId)}`

  return (
    <a href={href} target="_blank" style={{ width: "100%", height: "100px" }}>
      <div style={{ width: "100%", height: "100px" }} ref={ref} />
    </a>
  )
}

export function LocationImage({
  markerLocation,
  variant = "color",
  geoInfo,
}: {
  markerLocation: string

  variant?: "gray" | "color"
  geoInfo: NonNullable<Place["geoInfo"]>
}) {
  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={["places", "marker"]}
      version="beta"
    >
      <InternalLocationImage
        geoInfo={geoInfo}
        markerLocation={markerLocation}
        variant={variant}
      />
    </Wrapper>
  )
}

type GMapsPlace = {
  name: string
  address: string
  geoInfo: Place["geoInfo"]
}

export function LocationSelect({
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
    if (!service) {
      return
    }
    service.addListener("place_changed", () => {
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

export function PlacesCreateView() {
  const search = useLocation().search
  const [saving, setSaving] = useState(false)
  const [location, setLocation] = useState("")
  const [geoInfo, setGeoInfo] = useState<Place["geoInfo"] | null>(null)
  const user = useUser()
  const friends = useFriends(user.data?.uid ?? null)
  const history = useHistory()
  const toast = useToast()
  const [name, setName] = useState(() => {
    const searchParams = new URLSearchParams(search)
    return searchParams.get("default_name") ?? ""
  })

  const handleClearPlace = () => {
    setGeoInfo(null)
    setName("")
    setLocation("")
  }

  return (
    <Page>
      <Heading as="h1" size="lg">
        Place
      </Heading>
      <VStack
        as="form"
        width="100%"
        onSubmit={(e) => {
          e.preventDefault()
          if (user.data == null) {
            return
          }
          setSaving(true)
          api
            .placeCreate({
              name,
              location,
              geoInfo,
              userId: user.data.uid,
              friendIds: friends !== "loading" ? friends.map((f) => f.id) : [],
            })
            .then((docId) => {
              history.push(pathPlaceDetail({ placeId: docId }))
              setSaving(false)
            })
            .catch((error: FirebaseError) => {
              toast({
                title: "Problem creating account",
                description: `${error.code}: ${error.message}`,
                status: "error",
                isClosable: true,
              })
              setSaving(false)
            })
        }}
      >
        <Wrapper
          apiKey={GOOGLE_MAPS_API_KEY}
          libraries={["places", "marker"]}
          version="beta"
        >
          <FormControl>
            {/* Use a hidden character to change the label so Safari doesn't try to auto suggest contact names. */}
            <FormLabel>N{"͏"}ame (required)</FormLabel>

            <HStack>
              <LocationSelect
                value={name}
                isDisabled={geoInfo != null}
                onSelect={(v) => {
                  setGeoInfo(v?.geoInfo ?? null)
                  setName(v?.name ?? "")
                  setLocation(v?.address ?? "")
                }}
                onChange={(v) => {
                  setName(v)
                }}
              />
              <Button
                variant={"outline"}
                isDisabled={geoInfo == null}
                onClick={handleClearPlace}
              >
                Clear
              </Button>
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input
              type="text"
              isDisabled={geoInfo != null}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
              }}
            />
          </FormControl>

          {geoInfo != null && (
            <LocationImage
              markerLocation={location}
              geoInfo={geoInfo}
              variant="gray"
            />
          )}

          <Button
            size="lg"
            type="submit"
            isLoading={saving}
            loadingText="Creating place..."
          >
            Create Place
          </Button>
        </Wrapper>
      </VStack>
    </Page>
  )
}
