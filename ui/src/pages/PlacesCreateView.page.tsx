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
import { useCallback, useRef, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"

import * as api from "../api"
import { Page } from "../components/Page"
import { GOOGLE_MAPS_API_KEY } from "../config"
import { useFriends, useUser } from "../hooks"
import { pathPlaceDetail } from "../paths"

export function LocationImage({
  markerLocation,
  mapsUrl,
  variant = "color",
}: {
  markerLocation: string
  mapsUrl: string
  variant?: "gray" | "color"
}) {
  const searchParams = {
    key: GOOGLE_MAPS_API_KEY,
    // map_id: "a7ace313e8de6a37",
    map_id: variant === "color" ? "a7ace313e8de6a37" : "5b431cb5aca0f386",
    markers:
      variant === "gray" ? `color:black|${markerLocation}` : markerLocation,
    zoom: "14",
    size: "600x100",

    scale: "2",
    ts: "100",
  }
  const url = new URL("https://maps.googleapis.com/maps/api/staticmap")
  for (const [key, val] of Object.entries(searchParams)) {
    url.searchParams.set(key, val)
  }

  return (
    <a href={mapsUrl} target="_blank">
      <img src={url.href} />
    </a>
  )
}

function LocationPicker() {
  const search = useLocation().search
  const nameRef = useRef<HTMLInputElement | null>(null)

  const locationRef = useRef<HTMLInputElement>(null)

  const [place, setPlace] = useState<google.maps.places.PlaceResult | null>(
    null,
  )

  const autoCompleteRef = useCallback(
    (node: HTMLInputElement | null) => {
      nameRef.current = node
      if (node !== null) {
        const searchParams = new URLSearchParams(search)
        node.value = searchParams.get("default_name") ?? ""
        const service = new google.maps.places.Autocomplete(node, {
          types: ["food"],
        })

        service.addListener("place_changed", () => {
          const place = service.getPlace()
          setPlace(place)
          node.value = `${place.name} — ${place.rating} stars, ${place.user_ratings_total} reviews`
          if (locationRef.current) {
            locationRef.current.value = place.formatted_address ?? ""
          }
        })
      }
    },
    [search],
  )

  const handleClearPlace = () => {
    setPlace(null)
    if (nameRef.current != null) {
      nameRef.current.value = ""
    }
    if (locationRef.current) {
      locationRef.current.value = ""
    }
  }

  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <FormControl>
        {/* Use a hidden character to change the label so Safari doesn't try to auto suggest contact names. */}
        <FormLabel>N{"͏"}ame (required)</FormLabel>

        <HStack>
          <Input
            type="text"
            ref={autoCompleteRef}
            isDisabled={place != null}
            isRequired
          />
          <Button
            variant={"outline"}
            isDisabled={place == null}
            onClick={handleClearPlace}
          >
            Clear
          </Button>
        </HStack>
      </FormControl>

      <FormControl>
        <FormLabel>Location</FormLabel>
        <Input type="text" ref={locationRef} isDisabled={place != null} />
      </FormControl>

      {place != null && (
        <LocationImage
          markerLocation={place.formatted_address ?? ""}
          mapsUrl={place.url ?? ""}
        />
      )}
    </Wrapper>
  )
}

export function PlacesCreateView() {
  const search = useLocation().search
  const nameRef = useRef<HTMLInputElement | null>(null)
  const [saving, setSaving] = useState(false)
  const user = useUser()
  const friends = useFriends(user.data?.uid ?? null)
  const history = useHistory()
  const toast = useToast()
  const locationRef = useRef<HTMLInputElement>(null)

  const [place, setPlace] = useState<google.maps.places.PlaceResult | null>(
    null,
  )

  const autoCompleteRef = useCallback(
    (node: HTMLInputElement | null) => {
      nameRef.current = node
      if (node !== null) {
        const searchParams = new URLSearchParams(search)
        node.value = searchParams.get("default_name") ?? ""
        const service = new google.maps.places.Autocomplete(node, {
          types: ["food"],
        })

        service.addListener("place_changed", () => {
          const place = service.getPlace()
          setPlace(place)
          node.value = `${place.name} — ${place.rating} stars, ${place.user_ratings_total} reviews`
          if (locationRef.current) {
            locationRef.current.value = place.formatted_address ?? ""
          }
        })
      }
    },
    [search],
  )

  const handleClearPlace = () => {
    setPlace(null)
    if (nameRef.current != null) {
      nameRef.current.value = ""
    }
    if (locationRef.current) {
      locationRef.current.value = ""
    }
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
          const name = place != null ? place.name : nameRef.current?.value
          const location =
            place != null ? place.formatted_address : locationRef.current?.value
          if (name == null || location == null) {
            return
          }
          setSaving(true)
          api
            .placeCreate({
              name,
              location,
              googleMapsPlaceId: place?.place_id ?? null,
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
              <Input
                type="text"
                ref={autoCompleteRef}
                isDisabled={place != null}
                isRequired
              />
              <Button
                variant={"outline"}
                isDisabled={place == null}
                onClick={handleClearPlace}
              >
                Clear
              </Button>
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input type="text" ref={locationRef} isDisabled={place != null} />
          </FormControl>

          {place != null && (
            <LocationImage
              markerLocation={place.formatted_address ?? ""}
              mapsUrl={place.url ?? ""}
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
