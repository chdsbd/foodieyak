import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spacer,
  Switch,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { parseISO } from "date-fns"
import { FirebaseError } from "firebase/app"
import produce from "immer"
import { groupBy } from "lodash-es"
import { useState } from "react"
import { Link, useHistory, useParams } from "react-router-dom"

import * as api from "../../api"
import { DelayedLoader } from "../../components/DelayedLoader"
import { EmptyStateText } from "../../components/EmptyStateText"
import { Page } from "../../components/Page"
import { Downvote, Upvote } from "../../components/Ratings"
import { ReadonlyInput } from "../../components/ReadonlyInput"
import { toISODateString } from "../../date"
import { useMenuItems, usePlace, useUser } from "../../hooks"
import { pathCheckinDetail, pathPlaceDetail } from "../../paths"
import { SelectMenuItemModal } from "./SelectMenuItemModal"

export function MenuItem(props: {
  menuItemName: string
  rating: -1 | 1
  setRating: (_: -1 | 1) => void
  onRemove: () => void
}) {
  return (
    <Card w="100%" size="sm">
      <CardBody>
        <VStack w="100%">
          <FormControl>
            <FormLabel>{props.menuItemName}</FormLabel>
            <ButtonGroup w="100%">
              <Upvote
                showColor={props.rating > 0}
                onClick={() => {
                  props.setRating(1)
                }}
              />
              <Downvote
                showColor={props.rating < 0}
                onClick={() => {
                  props.setRating(-1)
                }}
              />
              <Spacer />
              <Button
                size="sm"
                variant={"outline"}
                onClick={() => {
                  props.onRemove()
                }}
              >
                Remove
              </Button>
            </ButtonGroup>
          </FormControl>
        </VStack>
      </CardBody>
    </Card>
  )
}

export type MenuItemRating = {
  menuItemId: string
  comment: string
  rating: 1 | -1
}

export function CheckInCreateView() {
  const { placeId }: { placeId: string } = useParams()
  const place = usePlace(placeId)
  const user = useUser()
  const menuItems = useMenuItems(placeId)
  const history = useHistory()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<string>(toISODateString(new Date()))
  const [isDateEnabled, setIsDateEnabled] = useState(true)
  const [comment, setComment] = useState<string>("")
  const [showHelperText, setShowHelperText] = useState(false)
  const [isCreating, setCreatingCheckin] = useState(false)

  const [menuItemRatings, setMenutItemRatings] = useState<MenuItemRating[]>([])

  if (place === "loading" || menuItems === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  const menuItemMap = groupBy(menuItems, (x) => x.id)

  return (
    <Page>
      <Heading as="h1" size="lg">
        Check-In
      </Heading>

      <FormControl>
        <FormLabel>Place</FormLabel>
        <HStack>
          <ReadonlyInput value={place.name} />
          <Button
            size="sm"
            as={Link}
            variant="outline"
            to={pathPlaceDetail({ placeId })}
          >
            View
          </Button>
        </HStack>
      </FormControl>

      <FormControl>
        <HStack alignItems={"center"} justify="space-between">
          <FormLabel htmlFor="is-date-enabled" sx={{ userSelect: "none" }}>
            Date
          </FormLabel>
          <Switch
            id="is-date-enabled"
            isChecked={isDateEnabled}
            marginBottom={2}
            onChange={(e) => {
              setIsDateEnabled(e.target.checked)
            }}
          />
        </HStack>
        <HStack>
          {isDateEnabled ? (
            <Input
              type="date"
              onChange={(e) => {
                setDate(e.target.value)
              }}
              value={toISODateString(date)}
            />
          ) : (
            <Input type="text" disabled value={"-"} />
          )}
        </HStack>
      </FormControl>
      <FormControl>
        <FormLabel>Comment</FormLabel>
        <Textarea
          placeholder="Add a note about your visit..."
          onChange={(e) => {
            setComment(e.target.value)
          }}
          value={comment}
        />
      </FormControl>

      <Heading as="h2" size="md" alignSelf={"start"} w="full">
        <HStack w="full">
          <span>Menu Items</span>
          <Spacer />
          <Button
            size="sm"
            onClick={() => {
              setIsOpen(true)
            }}
          >
            Add Menu Item
          </Button>
        </HStack>
      </Heading>

      <SelectMenuItemModal
        isOpen={isOpen}
        placeId={placeId}
        userId={user.data?.uid ?? ""}
        onClose={() => {
          setIsOpen(false)
        }}
        menuItems={menuItems}
        onSelect={(menuItemId) => {
          setMenutItemRatings(
            produce((s) => {
              if (s.find((x) => x.menuItemId === menuItemId) != null) {
                return
              } else {
                s.push({ menuItemId, comment: "", rating: 1 })
              }
              return s
            }),
          )
        }}
        onRemove={(menuItemId) => {
          setMenutItemRatings(
            produce((s) => {
              return s.filter((x) => x.menuItemId !== menuItemId)
            }),
          )
        }}
        selectedMenuItemIds={menuItemRatings.map((x) => x.menuItemId)}
      />

      {menuItemRatings.length === 0 && (
        <>
          <Spacer paddingY={"0.5"} />
          <EmptyStateText>Add a menu item to review.</EmptyStateText>
        </>
      )}
      {menuItemRatings.map((mir) => {
        return (
          <MenuItem
            key={mir.menuItemId}
            menuItemName={menuItemMap[mir.menuItemId][0].name}
            rating={mir.rating}
            setRating={(rating) => {
              setMenutItemRatings(
                produce((s) => {
                  const item = s.find((x) => x.menuItemId === mir.menuItemId)
                  if (item != null) {
                    item.rating = rating
                  }
                  return s
                }),
              )
            }}
            onRemove={() => {
              setMenutItemRatings((s) => {
                return s.filter((x) => x.menuItemId !== mir.menuItemId)
              })
            }}
          />
        )
      })}

      <Divider paddingY="1" />
      <FormControl isInvalid={menuItemRatings.length === 0 && showHelperText}>
        <Button
          width="100%"
          loadingText="Creating check-in"
          isLoading={isCreating}
          onClick={() => {
            if (user.data == null) {
              return
            }
            if (menuItemRatings.length === 0) {
              setShowHelperText(true)
              return
            }
            setCreatingCheckin(true)
            api.checkin
              .create({
                userId: user.data.uid,
                date: parseISO(date),
                placeId: place.id,
                comment,
                reviews: menuItemRatings,
              })
              .then((checkInId) => {
                setCreatingCheckin(false)
                history.push(pathCheckinDetail({ placeId, checkInId }))
              })
              .catch((e: FirebaseError) => {
                setCreatingCheckin(false)
                toast({
                  title: "Problem creating check-in",
                  description: `${e.code}: ${e.message}`,
                  status: "error",
                })
              })
          }}
        >
          Create Check-In
        </Button>
        {showHelperText && (
          <FormErrorMessage>
            Review at least one menu item to save check-in.
          </FormErrorMessage>
        )}
      </FormControl>
    </Page>
  )
}
