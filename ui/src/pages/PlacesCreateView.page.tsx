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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { useHistory, useLocation } from "react-router-dom"

import * as api from "../api"
import { Page } from "../components/Page"
import { GOOGLE_MAPS_API_KEY } from "../config"
import { useFriends, useUser } from "../hooks"
import { pathPlaceDetail } from "../paths"

export function LocationImage({
  markerLocation,
  googleMapsPlaceId,
  variant = "color",
}: {
  markerLocation: string
  googleMapsPlaceId: string
  variant?: "gray" | "color"
}) {
  // We adjust the width of the image to fit the anchor element.
  //
  // We use object-fit: cover to ensure the image looks okay even if the size is off.
  // By using the exact size, Google Maps will render a better looking image that has points of interest correctly fitted in the image.
  const ref = useRef<HTMLAnchorElement | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth)
    }
  }, [])

  const searchParams = {
    key: GOOGLE_MAPS_API_KEY,
    map_id: variant === "color" ? "a7ace313e8de6a37" : "5b431cb5aca0f386",
    markers:
      variant === "gray" ? `color:black|${markerLocation}` : markerLocation,
    zoom: "14",
    size: `${width}x100`,
    scale: "2",
    ts: "100",
  }
  const url = new URL("https://maps.googleapis.com/maps/api/staticmap")
  for (const [key, val] of Object.entries(searchParams)) {
    url.searchParams.set(key, val)
  }

  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    markerLocation,
  )}&query_place_id=${encodeURIComponent(googleMapsPlaceId)}`

  return (
    <a href={href} target="_blank" ref={ref} style={{ width: "100%" }}>
      {width > 0 && (
        <img style={{ height: "100px", objectFit: "cover" }} src={url.href} />
      )}
    </a>
  )
}

type GMapsPlace = { name: string; address: string; googleMapsPlaceId: string }

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
      if (
        place.name != null &&
        place.formatted_address != null &&
        place.place_id != null
      ) {
        onSelect({
          name: place.name,
          address: place.formatted_address,
          googleMapsPlaceId: place.place_id,
        })
      }
    })
  }, [onSelect])

  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
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
  const [placeId, setPlaceId] = useState<string>()
  const user = useUser()
  const friends = useFriends(user.data?.uid ?? null)
  const history = useHistory()
  const toast = useToast()
  const [name, setName] = useState(() => {
    const searchParams = new URLSearchParams(search)
    return searchParams.get("default_name") ?? ""
  })

  const handleClearPlace = () => {
    setPlaceId(undefined)
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
              name: "",
              location: "",
              googleMapsPlaceId: "place?.place_id ?? null",
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
        <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <FormControl>
            {/* Use a hidden character to change the label so Safari doesn't try to auto suggest contact names. */}
            <FormLabel>N{"͏"}ame (required)</FormLabel>

            <HStack>
              <LocationSelect
                value={name}
                isDisabled={placeId != null}
                onSelect={(v) => {
                  setPlaceId(v?.googleMapsPlaceId)
                  setName(v?.name ?? "")
                  setLocation(v?.address ?? "")
                }}
                onChange={(v) => {
                  setName(v)
                }}
              />
              <Button
                variant={"outline"}
                isDisabled={placeId == null}
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
              isDisabled={placeId != null}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
              }}
            />
          </FormControl>

          {placeId != null && (
            <LocationImage
              markerLocation={location}
              googleMapsPlaceId={placeId}
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
