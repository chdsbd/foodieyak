import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import { useState } from "react"
import { useHistory } from "react-router-dom"

import { Place } from "../api-schemas"
import { mergePlaceIntoPlace } from "../db"
import { usePlaces } from "../hooks"
import { pathPlaceDetail } from "../paths"

export function MergePlaceIntoPlaceModal({
  isOpen,
  onClose,
  userId,
  originalPlace,
}: {
  isOpen: boolean
  onClose: () => void
  userId: string
  originalPlace: Place
}) {
  const toast = useToast()
  const places = usePlaces(userId)
  const [selectedPlaceId, setSelectedPlace] = useState<string>()
  const [isMerging, setIsMerging] = useState(false)
  const history = useHistory()
  const selectedPlace =
    places !== "loading" ? places.find((x) => x.id === selectedPlaceId) : null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader paddingBottom={"0"}>Merge Places</ModalHeader>
        <ModalCloseButton />

        <VStack as={ModalBody} w="full">
          <Text fontSize={"sm"} alignSelf="start">
            Merge a source place into the target place. Checkins and menu items
            will be moved too.
          </Text>
          <FormControl>
            <FormLabel>Source Place</FormLabel>
            <Input isReadOnly value={originalPlace.name} />
          </FormControl>

          <FormControl>
            <FormLabel>Destination Place</FormLabel>
            <Select
              defaultValue={"-1"}
              onChange={(e) => {
                if (places === "loading") {
                  return
                }
                const place = places.find((x) => x.id === e.target.value)
                if (!place) {
                  return
                }
                setSelectedPlace(place.id)
              }}
            >
              <option disabled value="-1">
                Select a destination place...
              </option>

              {places !== "loading" &&
                places
                  .filter((x) => x.id !== originalPlace.id)
                  .map((place) => {
                    return (
                      <option key={place.id} value={place.id}>
                        {place.location
                          ? `${place.name} — ${place.location}`
                          : place.name}
                      </option>
                    )
                  })}
            </Select>

            {selectedPlace && (
              <FormHelperText>
                Merge "{originalPlace.name}" ({originalPlace.checkInCount}{" "}
                checkins, {originalPlace.menuItemCount} menu items) into "
                {selectedPlace.name}" ({selectedPlace.checkInCount} checkins,{" "}
                {selectedPlace.menuItemCount} menu items).
              </FormHelperText>
            )}
          </FormControl>
        </VStack>

        <ModalFooter paddingTop="0">
          <Button
            w="full"
            loadingText="Merging"
            isLoading={isMerging}
            onClick={() => {
              if (!selectedPlace) {
                return
              }
              if (
                !confirm(
                  `Are you sure you want to merge '${originalPlace.name}' into '${selectedPlace.name}'`,
                )
              ) {
                return
              }
              setIsMerging(true)
              mergePlaceIntoPlace({
                oldPlaceId: originalPlace.id,
                targetPlaceId: selectedPlace.id,
              })
                .then(() => {
                  toast({
                    title: "Places merged",
                    status: "success",
                    isClosable: true,
                  })
                  history.push(pathPlaceDetail({ placeId: selectedPlace.id }))
                  setIsMerging(false)
                })
                .catch((e: FirebaseError) => {
                  toast({
                    title: "Problem merging places",
                    description: `${e.code}: ${e.message}`,
                    status: "error",
                  })
                  setIsMerging(false)
                })
            }}
          >
            Merge Places
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
