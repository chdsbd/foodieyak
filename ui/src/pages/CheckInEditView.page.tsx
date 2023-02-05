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
  Switch,
  Textarea,
  useToast,
} from "@chakra-ui/react"
import parseISO from "date-fns/parseISO"
import { FirebaseError } from "firebase/app"
import produce from "immer"
import { groupBy } from "lodash-es"
import { useState } from "react"
import { Link, useHistory, useParams } from "react-router-dom"

import * as api from "../api"
import { Place, PlaceCheckIn, PlaceMenuItem } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { Page } from "../components/Page"
import { ReadonlyInput } from "../components/ReadonlyInput"
import { toISODateString } from "../date"
import { useCheckIn, useMenuItems, usePlace, useUser } from "../hooks"
import { pathCheckinDetail, pathPlaceDetail } from "../paths"
import {
  MenuItem,
  MenuItemRating,
} from "./CheckInCreateView/CheckInCreateView.page"
import { SelectMenuItemModal } from "./CheckInCreateView/SelectMenuItemModal"

export function CheckInEditView() {
  const { placeId, checkInId }: { placeId: string; checkInId: string } =
    useParams()
  const place = usePlace(placeId)
  const menuItems = useMenuItems(placeId)
  const checkIn = useCheckIn(placeId, checkInId)

  if (place === "loading" || menuItems === "loading" || checkIn === "loading") {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }

  return (
    <CheckInEditForm checkIn={checkIn} menuItems={menuItems} place={place} />
  )
}

function CheckInEditForm({
  checkIn,
  menuItems,
  place,
}: {
  checkIn: PlaceCheckIn
  menuItems: PlaceMenuItem[]
  place: Place
}) {
  const history = useHistory()
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const user = useUser()

  const [isDateEnabled, setIsDateEnabled] = useState(
    checkIn.checkedInAt != null,
  )
  const [date, setDate] = useState<string>(() => {
    const checkedInAt = checkIn.checkedInAt
    if (checkedInAt == null) {
      return toISODateString(new Date())
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const createdAt: Date = checkedInAt.toDate()
      return toISODateString(createdAt)
    }
  })
  const [comment, setComment] = useState<string>(checkIn.comment)
  const [menuItemRatings, setMenutItemRatings] = useState<MenuItemRating[]>(
    checkIn.ratings,
  )
  const [isOpen, setIsOpen] = useState(false)

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
          <ReadonlyInput value={place.name} />
          <Button
            size="sm"
            as={Link}
            to={pathPlaceDetail({ placeId: place.id })}
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
        placeId={place.id}
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
      {menuItemRatings.map((mir) => {
        return (
          <MenuItem
            key={mir.menuItemId}
            menuItemName={menuItemMap[mir.menuItemId][0].name}
            rating={mir.rating}
            comment={mir.comment}
            setComment={(comment) => {
              setMenutItemRatings(
                produce((s) => {
                  const item = s.find((x) => x.menuItemId === mir.menuItemId)
                  if (item != null) {
                    item.comment = comment
                  }
                  return s
                }),
              )
            }}
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

      <Spacer paddingY="2" />
      <ButtonGroup w="full">
        <Button
          variant={"outline"}
          as={Link}
          to={pathCheckinDetail({ placeId: place.id, checkInId: checkIn.id })}
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
                date: isDateEnabled ? parseISO(date) : null,
                placeId: place.id,
                comment,
                reviews: menuItemRatings,
                checkInId: checkIn.id,
              })
              .then(() => {
                history.push(
                  pathCheckinDetail({
                    placeId: place.id,
                    checkInId: checkIn.id,
                  }),
                )
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
      <Spacer />
      <Divider />
      <Spacer />
      <FormControl>
        <Button
          variant={"outline"}
          colorScheme={"red"}
          size="sm"
          isLoading={isDeleting}
          isDisabled={isCheckInAuthor}
          loadingText="Removing Check-In"
          onClick={() => {
            if (confirm("Are you sure you want to remove this check-in?")) {
              setIsDeleting(true)
              api.checkin
                .delete({ placeId: place.id, checkInId: checkIn.id })
                .then(() => {
                  history.push(pathPlaceDetail({ placeId: place.id }))
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
