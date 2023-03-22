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
import { useState } from "react"
import { useHistory, useLocation } from "react-router-dom"

import * as api from "../api"
import { Place } from "../api-schemas"
import { GoogleMapsJSMap } from "../components/GoogleMapsJSMap"
import { GoogleMapsSelectInput } from "../components/GoogleMapsSelectInput"
import { Page } from "../components/Page"
import { GOOGLE_MAPS_API_KEY } from "../config"
import { useFriends, useUser } from "../hooks"
import { pathPlaceDetail } from "../paths"

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
              friendIds:
                friends !== "loading" && friends !== "error"
                  ? friends.map((f) => f.id)
                  : [],
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
              <GoogleMapsSelectInput
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
            <GoogleMapsJSMap
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
