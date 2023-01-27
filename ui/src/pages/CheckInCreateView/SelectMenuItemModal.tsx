import {
  Button,
  Card,
  CardBody,
  Divider,
  FormControl,
  Heading,
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
import { orderBy } from "lodash-es"
import React, { useEffect, useState } from "react"

import { PlaceMenuItem } from "../../api-schemas"
import * as api from "../../api"
import { FirebaseError } from "firebase/app"

export function SelectMenuItemModal({
  isOpen,
  onClose,
  menuItems: menuItemsRaw,
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
  const menuItems = orderBy(menuItemsRaw, (x) => x.name, ["asc"])
  const selectedMenuItems = menuItems.filter((x) =>
    selectedMenuItemIds.includes(x.id),
  )

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
              .filter((x) => !selectedMenuItemIds.includes(x.id))
              .map((mir) => {
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
                              onSelect(mir.id)
                            }}
                          >
                            Select
                          </Button>
                        }
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
