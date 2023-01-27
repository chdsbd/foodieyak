import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Spacer,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { format, parseISO } from "date-fns"
import { FirebaseError } from "firebase/app"
import produce from "immer"
import { groupBy } from "lodash-es"
import { useState } from "react"
import { Link, useHistory, useParams } from "react-router-dom"

import * as api from "../api"
import { Place } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { Page } from "../components/Page"
import { Downvote, Upvote } from "../components/Ratings"
import { useMenuItems, usePlace, useUser } from "../hooks"

function toISODateString(date: Date | string | number): string {
  // Note(sbdchd): parseISO("2019-11-09") !== new Date("2019-11-09")
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "yyyy-MM-dd")
}

export function MenuItemCreator(props: {
  place: Place
  selectedMenuItemIds: string[]
  onSelect: (_: string) => void
}) {
  const user = useUser()
  const menuItems = useMenuItems(props.place.id)
  const toast = useToast()
  const [selectValue, setSelectValue] = useState<string>("")
  if (user.data == null || menuItems === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  return (
    <VStack w="100%">
      <FormControl>
        <Select
          value={selectValue}
          onChange={(e) => {
            if (e.target.value === "new") {
              const res = prompt("Menu Item Name?")
              if (res) {
                api.menuItems
                  .create({
                    placeId: props.place.id,
                    name: res,
                    userId: user.data.uid,
                  })
                  .then((menuItemId) => {
                    props.onSelect(menuItemId)
                  })
                  .catch((e: FirebaseError) => {
                    toast({
                      title: "Problem creating menu item",
                      description: `${e.code}: ${e.message}`,
                      status: "error",
                    })
                  })
              }
            } else {
              props.onSelect(e.target.value)
            }
            setSelectValue("")
          }}
        >
          <option value="" selected disabled>
            Select a menu item to rate
          </option>
          <option value="new">Create new menu item...</option>
          {menuItems
            .filter((x) => !props.selectedMenuItemIds.includes(x.id))
            .map((mi) => (
              <option key={mi.id} value={mi.id}>
                {mi.name} — {mi.createdById}
              </option>
            ))}
        </Select>
      </FormControl>
    </VStack>
  )
}

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

  const [date, setDate] = useState<string>(toISODateString(new Date()))
  const [comment, setComment] = useState<string>("")

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
          <Input
            type="text"
            value={place.name}
            disabled
            sx={{ _disabled: {}, _hover: {} }}
          />
          <Button
            size="sm"
            as={Link}
            variant="outline"
            to={`/place/${place.id}`}
          >
            View
          </Button>
        </HStack>
      </FormControl>

      <FormControl>
        <FormLabel>Date</FormLabel>
        <Input
          type="date"
          onChange={(e) => {
            setDate(e.target.value)
          }}
          value={toISODateString(date)}
        />
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

      <Heading as="h2" size="md" alignSelf={"start"}>
        Menu Items
      </Heading>

      {/* TODO(chdsbd): Replace with modal for creating new menu items. This is glitchy adn we need a loading state.*/}
      <MenuItemCreator
        place={place}
        selectedMenuItemIds={menuItemRatings.map((x) => x.menuItemId)}
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
      />
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

      <Button
        width="100%"
        onClick={() => {
          if (user.data == null) {
            return
          }
          api.checkin
            .create({
              userId: user.data.uid,
              date: new Date(date),
              placeId: place.id,
              comment,
              reviews: menuItemRatings,
            })
            .then((checkInId) => {
              history.push(`/place/${place.id}/check-in/${checkInId}`)
            })
            .catch((e: FirebaseError) => {
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
    </Page>
  )
}
