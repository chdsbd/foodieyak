import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spacer,
  Textarea,
  useToast,
} from "@chakra-ui/react"
import { FirebaseError } from "firebase/app"
import produce from "immer"
import { groupBy } from "lodash-es"
import { useEffect, useState } from "react"
import { Link, useHistory, useParams } from "react-router-dom"

import * as api from "../api"
import { DelayedLoader } from "../components/DelayedLoader"
import { Page } from "../components/Page"
import { formatHumanDate, toISODateString } from "../date"
import { useCheckIn, useMenuItems, usePlace, useUser } from "../hooks"
import {
  MenuItem,
  MenuItemCreator,
  MenuItemRating,
} from "./CheckInCreateView.page"

export function CheckInEditView() {
  const { placeId, checkInId }: { placeId: string; checkInId: string } =
    useParams()
  const place = usePlace(placeId)
  const user = useUser()
  const menuItems = useMenuItems(placeId)
  const checkIn = useCheckIn(placeId, checkInId)
  const history = useHistory()
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [date, setDate] = useState<string>(toISODateString(new Date()))
  const [comment, setComment] = useState<string>("")

  useEffect(() => {
    if (checkIn !== "loading") {
      setComment(checkIn.comment)
    }
  }, [checkIn?.comment])
  useEffect(() => {
    if (checkIn !== "loading") {
      setDate(toISODateString(checkIn.createdAt.toDate()))
    }
  }, [checkIn?.createdAt])

  const [menuItemRatings, setMenutItemRatings] = useState<MenuItemRating[]>([])

  if (place === "loading" || menuItems === "loading" || checkIn === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
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

        <BreadcrumbItem>
          <BreadcrumbLink
            as={Link}
            to={`/place/${place.id}/check-in/${checkInId}`}
          >
            Check-In — {formatHumanDate(checkIn.createdAt)}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            as={Link}
            to={`/place/${place.id}/check-in/${checkInId}/edit`}
          >
            Edit
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Heading as="h1" size="lg">
        Check-In
      </Heading>

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

      <ButtonGroup w="full">
        <Button variant={"outline"}>Cancel</Button>
        <Spacer />
        <Button
          loadingText="Saving changes..."
          isLoading={isSaving}
          onClick={() => {
            if (user.data == null) {
              return
            }
            setIsSaving(true)
            api.checkin
              .update({
                userId: user.data.uid,
                date: new Date(date),
                placeId: place.id,
                comment,
                reviews: menuItemRatings,
                checkInId,
              })
              .then(() => {
                history.push(`/place/${place.id}/check-in/${checkInId}`)
                setIsSaving(false)
              })
              .catch((e: FirebaseError) => {
                toast({
                  title: "Problem creating check-in",
                  description: `${e.code}: ${e.message}`,
                  status: "error",
                })
                setIsSaving(false)
              })
          }}
        >
          Save Changes
        </Button>
      </ButtonGroup>
    </Page>
  )
}
