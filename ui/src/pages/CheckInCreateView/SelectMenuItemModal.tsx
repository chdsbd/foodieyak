import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormHelperText,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import React, { useEffect, useState } from "react"

import * as api from "../../api"
import { PlaceMenuItem } from "../../api-schemas"

export function SelectMenuItemModal({
  isOpen,
  onClose,
  menuItems,
  onSelect,
  onRemove,
  selectedMenuItemIds,
  userId,
  placeId,
}: {
  isOpen: boolean
  onClose: () => void
  userId: string
  placeId: string
  menuItems: PlaceMenuItem[]
  onSelect: (_: string) => void
  onRemove: (_: string) => void
  selectedMenuItemIds: string[]
}) {
  const [search, setSearch] = useState("")
  const toast = useToast()
  const [isCreating, setIsCreating] = useState(false)
  useEffect(() => {
    setSearch("")
  }, [isOpen])

  function onCreateAndSelect() {
    setIsCreating(true)
    api.menuItems
      .create({
        placeId,
        name: search.trim(),
        userId,
      })
      .then((menuItemId) => {
        onSelect(menuItemId)
        setSearch("")
        setIsCreating(false)
      })
      .catch((e: FirebaseError) => {
        toast({
          title: "Problem creating menu item",
          description: `${e.code}: ${e.message}`,
          status: "error",
        })
        setIsCreating(false)
      })
  }

  const isMobileViewportWidth = window.innerWidth < 500

  return (
    <Modal
      isOpen={isOpen}
      size={isMobileViewportWidth ? "full" : "lg"}
      onClose={onClose}
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent top="0" height="-webkit-fill-available">
        <ModalHeader paddingBottom={"0"}>Menu Item</ModalHeader>
        <ModalCloseButton />

        <VStack as={ModalBody} w="full" overflow="hidden">
          <FormControl>
            <Input
              type="search"
              placeholder="Search for menu items..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
            />
            <FormHelperText>
              {selectedMenuItemIds.length} selected menu items
            </FormHelperText>
          </FormControl>
          <VStack w="full" overflowY={"scroll"}>
            {search.trim() !== "" &&
              menuItems.filter(
                (x) =>
                  x.name.toLowerCase().trim() === search.trim().toLowerCase(),
              ).length === 0 && (
                <Card size="sm" w="full">
                  <HStack as={CardBody} w="full">
                    <Text>{search}</Text>
                    <Spacer />
                    <Button
                      size="sm"
                      loadingText="Creating..."
                      isLoading={isCreating}
                      onClick={onCreateAndSelect}
                    >
                      Create & Select
                    </Button>
                  </HStack>
                </Card>
              )}
            {menuItems
              .filter((x) =>
                x.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((mir) => {
                return (
                  <React.Fragment key={mir.id}>
                    <Card
                      size="sm"
                      w="full"
                      variant={"outline"}
                      //   colorScheme="purple"
                      //   borderColor={"purple"}
                      borderWidth={1}
                      borderColor={
                        selectedMenuItemIds.includes(mir.id)
                          ? "rgb(107, 70, 193)"
                          : undefined
                      }
                    >
                      <HStack as={CardBody} w="full">
                        <Text>{mir.name}</Text>
                        <Spacer />
                        {!selectedMenuItemIds.includes(mir.id) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            // colorScheme="purple"
                            onClick={() => {
                              onSelect(mir.id)
                            }}
                          >
                            Select
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            // colorScheme="orange"
                            variant="outline"
                            onClick={() => {
                              onRemove(mir.id)
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </HStack>
                    </Card>
                  </React.Fragment>
                )
              })}
            {/* <Divider /> */}
            {/* {selectedMenuItems.length > 0 && (
                <Heading as="h2" size="sm" alignSelf={"start"}>
                  Selected Menu Items
                </Heading>
              )}
              {selectedMenuItems.map((mir) => {
                return (
                  <React.Fragment key={mir.id}>
                    <Card size="sm" w="full">
                      <HStack as={CardBody} w="full">
                        <Text>{mir.name}</Text>
                        <Spacer />
                        {
                          <Button
                            size="sm"
                            onClick={() => {
                              onRemove(mir.id)
                            }}
                          >
                            Remove
                          </Button>
                        }
                      </HStack>
                    </Card>
                  </React.Fragment>
                )
              })} */}
          </VStack>
        </VStack>

        <ModalFooter paddingTop="0">
          <Button w="full" onClick={onClose}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
