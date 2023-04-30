import {
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spacer,
  Switch,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { useState } from "react"
import { Link, useHistory, useParams } from "react-router-dom"

import * as api from "../api"
import { Place } from "../api-schemas"
import { ErrorStateText } from "../components/ErrorStateText"
import { GoogleMapsJSMap } from "../components/GoogleMapsJSMap"
import { GoogleMapsSelectInput } from "../components/GoogleMapsSelectInput"
import { Page } from "../components/Page"
import { usePlace, useUser } from "../hooks"
import { pathPlaceDetail, pathPlaceList } from "../paths"
import { MergePlaceIntoPlaceModal } from "./MergePlaceintoPlaceModal"

export function PlacesEditView() {
  const { placeId }: { placeId: string } = useParams()

  const place = usePlace(placeId)
  if (place === "loading") {
    return (
      <Page>
        <div />
      </Page>
    )
  }
  if (place === "error") {
    return (
      <Page>
        <ErrorStateText>
          Problem loading place with id: {placeId}
        </ErrorStateText>
      </Page>
    )
  }

  return <PlacesEditViewInner place={place} />
}

export function PlacesEditViewInner({ place }: { place: Place }) {
  const user = useUser()
  const history = useHistory()
  const toast = useToast()

  const [name, setName] = useState(place.name)
  const [geoInfo, setGeoInfo] = useState<Place["geoInfo"] | null>(place.geoInfo)
  const [location, setLocation] = useState(place.location)
  const [isSkippable, setIsSkippable] = useState(place.isSkippableAt != null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)

  const placeId = place.id

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
            .placeUpdate({
              placeId,
              geoInfo,
              name,
              location,
              userId: user.data.uid,
              isSkippable,
            })
            .then(() => {
              history.push(pathPlaceDetail({ placeId }))
              setSaving(false)
            })
            .catch((error: FirebaseError) => {
              toast({
                title: "Problem updating place",
                description: `${error.code}: ${error.message}`,
                status: "error",
                isClosable: true,
              })
              setSaving(false)
            })
        }}
      >
        <FormControl>
          <FormLabel>Name</FormLabel>
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
              isDisabled={placeId == null}
              onClick={() => {
                setGeoInfo(null)
                setName("")
                setLocation("")
              }}
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
            onChange={(e) => {
              setLocation(e.target.value)
            }}
            value={location}
          />
        </FormControl>
        {geoInfo != null && (
          <GoogleMapsJSMap
            variant="gray"
            markerLocation={location}
            geoInfo={geoInfo}
          />
        )}
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="is-skippable" sx={{ userSelect: "none" }} mb="0">
            Skippable?
          </FormLabel>
          <Switch
            id="is-skippable"
            isChecked={isSkippable}
            onChange={(e) => {
              setIsSkippable(e.target.checked)
            }}
          />
        </FormControl>

        <Spacer />
        <ButtonGroup w="100%">
          <Link to={pathPlaceDetail({ placeId })}>
            <Button variant={"outline"}>Cancel</Button>
          </Link>
          <Spacer />
          <Button
            type="submit"
            isLoading={saving}
            loadingText="Saving place..."
          >
            Update Place
          </Button>
        </ButtonGroup>
      </VStack>
      <Spacer />
      <Divider />
      <Spacer />
      <HStack w="full">
        <Tooltip
          isDisabled={(place.checkInCount ?? 0) === 0}
          label={`Deletion disabled until all (${place.checkInCount}) check-ins have been deleted.`}
        >
          <Button
            size="sm"
            type="button"
            colorScheme={"red"}
            variant="outline"
            disabled={(place.checkInCount ?? 0) > 0}
            isLoading={deleting}
            loadingText="Deleting..."
            onClick={() => {
              if (!confirm("Delete place?")) {
                return
              }
              setDeleting(true)
              api
                .placeDelete({ placeId })
                .then(() => {
                  history.push(pathPlaceList({}))
                  setDeleting(false)
                })
                .catch((error: FirebaseError) => {
                  const errorCode = error.code
                  const errorMessage = error.message
                  toast({
                    title: "Problem deleting place",
                    description: `${errorCode}: ${errorMessage}`,
                    status: "error",
                    isClosable: true,
                  })
                  setDeleting(false)
                })
            }}
          >
            Delete Place
          </Button>
        </Tooltip>

        <Button
          size="sm"
          variant={"outline"}
          onClick={() => {
            setShowMergeModal(true)
          }}
        >
          Merge Place
        </Button>
      </HStack>
      {user.data != null && (
        <MergePlaceIntoPlaceModal
          originalPlace={place}
          userId={user.data.uid}
          isOpen={showMergeModal}
          onClose={() => {
            setShowMergeModal(false)
          }}
        />
      )}
    </Page>
  )
}
