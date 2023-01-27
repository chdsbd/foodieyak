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
  VStack,
} from "@chakra-ui/react"
import { orderBy } from "lodash-es"
import React, { useEffect, useState } from "react"

import { PlaceMenuItem } from "../../api-schemas"

export function SelectMenuItemModal({
  isOpen,
  onClose,
  menuItems: menuItemsRaw,
  onSelect,
  onRemove,
  selectedMenuItemIds,
}: {
  isOpen: boolean
  onClose: () => void
  menuItems: PlaceMenuItem[]
  onSelect: (_: string) => void
  onRemove: (_: string) => void
  selectedMenuItemIds: string[]
}) {
  const [search, setSearch] = useState("")
  useEffect(() => {
    setSearch("")
  }, [isOpen])
  const menuItems = orderBy(menuItemsRaw, (x) => x.name, ["asc"])
  const selectedMenuItems = menuItems.filter((x) =>
    selectedMenuItemIds.includes(x.id),
  )
  return (
    <Modal
      isOpen={isOpen}
      size={window.innerWidth < 500 ? "full" : "lg"}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent top="0">
        <ModalHeader paddingBottom={"0"}>Menu Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflow={"hidden"}>
          <VStack w="full" h="100%">
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
            <VStack w="full" overflow={"scroll"}>
              {search.trim() !== "" &&
                menuItems.filter(
                  (x) =>
                    x.name.toLowerCase().trim() === search.trim().toLowerCase(),
                ).length === 0 && (
                  <Card size="sm" w="full">
                    <HStack as={CardBody} w="full">
                      <Text>{search}</Text>
                      <Spacer />
                      <Button size="sm">Create & Select</Button>
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
              {selectedMenuItems.length > 0 && (
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
              })}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter paddingTop="0">
          <Button w="full" onClick={onClose}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
