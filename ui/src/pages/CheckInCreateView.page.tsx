import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
  VStack,
} from "@chakra-ui/react"
import { format, parseISO } from "date-fns"
import produce from "immer"
import { groupBy } from "lodash-es"
import { useState } from "react"
import { ThumbsDown, ThumbsUp } from "react-feather"
import { Link, useParams } from "react-router-dom"

import { Place } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { Page } from "../components/Page"
import { useMenuItems, usePlace, useUser } from "../hooks"
import { NoMatch } from "./NoMatchView.page"

function toISODateString(date: Date | string | number): string {
  // Note(sbdchd): parseISO("2019-11-09") !== new Date("2019-11-09")
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "yyyy-MM-dd")
}

function MenuItemCreator(props: {
  place: Place
  onSelect: (_: string) => void
}) {
  const user = useUser()
  const menuItems = useMenuItems(props.place.id)
  const [selectValue, setSelectValue] = useState<string>("")
  if (user.data == null || menuItems === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  return (
    <Card w="100%">
      <CardBody>
        <VStack w="100%">
          <FormControl>
            <FormLabel>New Menu Item</FormLabel>
            <Select
              value={selectValue}
              onChange={(e) => {
                if (e.target.value === "new") {
                  const res = prompt("Menu Item Name?")
                  if (res) {
                    // query
                    //   .menuItemCreate({
                    //     placeId: props.place.id,
                    //     name: res,
                    //     userId: user.data.uid,
                    //   })
                    //   .then((menuItem) => {
                    //     props.onSelect(menuItem.id);
                    //   });
                  }
                } else {
                  props.onSelect(e.target.value)
                }
                setSelectValue("")
              }}
            >
              <option value="" selected disabled>
                Choose an existing menu item
              </option>
              <option value="new">Create new menu item...</option>
              {menuItems.map((mi) => (
                <option key={mi.id} value={mi.id}>
                  {mi.name} — {mi.createdById}
                </option>
              ))}
            </Select>
          </FormControl>
        </VStack>
      </CardBody>
    </Card>
  )
}

function MenuItem(props: {
  menuItemName: string
  rating: -1 | 1
  setRating: (_: -1 | 1) => void
  onRemove: () => void
}) {
  return (
    <Card w="100%">
      <CardBody>
        <VStack w="100%">
          <FormControl>
            <FormLabel>{props.menuItemName}</FormLabel>
            <ButtonGroup w="100%">
              <Button
                onClick={() => {
                  props.setRating(1)
                }}
              >
                <ThumbsUp fill={props.rating > 0 ? "lightgreen" : "none"} />
              </Button>
              <Button
                onClick={() => {
                  props.setRating(-1)
                }}
              >
                <ThumbsDown fill={props.rating < 0 ? "orange" : "none"} />
              </Button>
              <Spacer />
              <Button
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

type MenuItemRating = {
  menuItemId: string
  rating: 1 | -1
}

export function CheckInCreateView() {
  const { placeId }: { placeId: string } = useParams()
  const place = usePlace(placeId)
  const user = useUser()
  const menuItems = useMenuItems(placeId)

  const [date, setDate] = useState<string>(toISODateString(new Date()))

  const [menuItemRatings, setMenutItemRatings] = useState<MenuItemRating[]>([])

  if (place === "loading" || menuItems === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }
  if (place === "not_found") {
    return <NoMatch />
  }

  const menuItemMap = groupBy(menuItems, (x) => x.id)

  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to={`/place/${place.id}`}>
            Tenoch
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to={`/place/${place.id}/check-in`}>
            Check-In
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <HStack w="100%">
        <Box
          minHeight={"100px"}
          minWidth="100px"
          background={"darkgray"}
          marginRight={4}
        >
          <div />
        </Box>
        <div>
          <div>{place.name}</div>
          <div>{place.location}</div>
        </div>
      </HStack>

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

      <Heading as="h2" size="md" alignSelf={"start"}>
        Menu Items
      </Heading>

      <MenuItemCreator
        place={place}
        onSelect={(menuItemId) => {
          setMenutItemRatings(
            produce((s) => {
              if (s.find((x) => x.menuItemId === menuItemId) != null) {
                return
              } else {
                s.push({ menuItemId, rating: 1 })
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
          // query
          //   .checkInCreate({
          //     userId: user.data.uid,
          //     date: date,
          //     placeId: place.id,
          //     reviews: menuItemRatings,
          //   })
          //   .then((checkIn) => {
          //     history.push(`/place/${place.id}/check-in/${checkIn.id}`);
          //   })
          //   .catch((e) => {
          //     toast({
          //       title: "Problem creating checkin",
          //       description: `${e.code}: ${e.message}`,
          //       status: "error",
          //     });
          //   });
        }}
      >
        Create Check-In
      </Button>
    </Page>
  )
}
