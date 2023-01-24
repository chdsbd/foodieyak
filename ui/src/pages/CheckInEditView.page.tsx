import {
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
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
import { toISODateString } from "../date"
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
  const [isDeleting, setIsDeleting] = useState(false)

  const [date, setDate] = useState<string>(toISODateString(new Date()))
  const [comment, setComment] = useState<string>("")
  const [menuItemRatings, setMenutItemRatings] = useState<MenuItemRating[]>([])

  useEffect(() => {
    if (checkIn !== "loading") {
      setComment(checkIn.comment)
    }
    // @ts-expect-error this will work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn?.comment])
  useEffect(() => {
    if (checkIn !== "loading") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const createdAt: Date = checkIn.createdAt.toDate()
      setDate(toISODateString(createdAt))
    }
    // @ts-expect-error this will work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn?.createdAt])
  useEffect(() => {
    if (checkIn !== "loading") {
      setMenutItemRatings(checkIn.ratings)
    }
    // @ts-expect-error this will work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn?.ratings])

  if (place === "loading" || menuItems === "loading" || checkIn === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  const isCheckInAuthor = checkIn.createdById !== user.data?.uid

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
          <Button size="sm" as={Link} to={`/place/${place.id}`}>
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
        <Button
          variant={"outline"}
          as={Link}
          to={`/place/${place.id}/check-in/${checkInId}`}
        >
          Cancel
        </Button>
        <Spacer />
        <Button
          loadingText="Saving changes"
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
                  title: "Problem updating check-in",
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
      <Divider />
      <FormControl>
        <Button
          variant={"outline"}
          colorScheme={"red"}
          isLoading={isDeleting}
          isDisabled={isCheckInAuthor}
          loadingText="Removing Check-In"
          onClick={() => {
            if (confirm("Are you sure you want to remove this check-in?")) {
              setIsDeleting(true)
              api.checkin
                .delete({ placeId, checkInId })
                .then(() => {
                  history.push(`/place/${place.id}`)
                  setIsDeleting(false)
                })
                .catch((e: FirebaseError) => {
                  toast({
                    title: "Problem deleting check-in",
                    description: `${e.code}: ${e.message}`,
                    status: "error",
                  })
                  setIsDeleting(false)
                })
            }
          }}
        >
          Remove Check-In
        </Button>
        {isCheckInAuthor && (
          <FormHelperText>
            Only the author may perform this action.
          </FormHelperText>
        )}
      </FormControl>
    </Page>
  )
}
