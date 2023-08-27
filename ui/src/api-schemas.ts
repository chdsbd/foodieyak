import { Timestamp } from "firebase/firestore"
import { z } from "zod"

const TimestampSchema = z.instanceof(Timestamp)

const BaseSchema = z.object({
  id: z.string(),
  createdById: z.string(),
  createdAt: TimestampSchema,
  lastModifiedById: z.nullable(z.string()),
  lastModifiedAt: z.nullable(TimestampSchema),
})

export const UserSchema = z.object({
  uid: z.string(),
  displayName: z.nullable(z.string()),
  email: z.string(),
  emailLookupField: z.optional(z.string()),
})

export type User = z.infer<typeof UserSchema>

export const UserPersonalInfoSchema = z.object({
  algoliaSearchApiKey: z.string().default(""),
})

export type UserPersonalInfo = z.infer<typeof UserPersonalInfoSchema>

export const PlaceSchema = BaseSchema.extend({
  name: z.string(),
  location: z.string(),
  geoInfo: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      googlePlaceId: z.string(),
    })
    .nullable()
    .default(null),
  viewerIds: z.array(z.string()),
  menuItemCount: z.number(),
  checkInCount: z.number().default(0),
  isSkippableById: z.nullable(z.string()).default(null),
  isSkippableAt: z.nullable(TimestampSchema).default(null),
})
export type Place = z.infer<typeof PlaceSchema>

export const PlaceMenuItemSchema = BaseSchema.extend({
  name: z.string(),
  checkInCount: z.number().default(0),
})
export type PlaceMenuItem = z.infer<typeof PlaceMenuItemSchema>

export const PlaceCheckInSchema = BaseSchema.extend({
  checkedInAt: z.nullable(TimestampSchema),
  comment: z.string(),
  ratingsMenuItemIds: z.array(z.string()).default([]),
  viewerIds: z.array(z.string()),
  placeId: z.string(),
  quickCheckin: z.boolean().default(false),
  ratings: z.array(
    z.object({
      menuItemId: z.string(),
      comment: z.string(),
      rating: z.literal(-1).or(z.literal(1)),
    }),
  ),
})
export type PlaceCheckIn = z.infer<typeof PlaceCheckInSchema>
export type CheckInRating = PlaceCheckIn["ratings"][0]

export const FriendSchema = BaseSchema.extend({
  accepted: z.boolean(),
  acceptedAt: z.nullable(TimestampSchema),
})

export type Friend = z.infer<typeof FriendSchema>

const ActivityAction = z.union([
  z.object({
    document: z.literal("checkin"),
    type: z.union([
      z.literal("create"),
      z.literal("delete"),
      z.literal("update"),
    ]),
    placeId: z.string(),
    checkinId: z.string(),
  }),
  z.object({
    document: z.literal("place"),
    type: z.union([
      z.literal("create"),
      z.literal("delete"),
      z.literal("update"),
    ]),
    placeId: z.string(),
  }),
  z.object({
    document: z.literal("place"),
    type: z.literal("merge"),
    movedPlaceId: z.string(),
    placeId: z.string(),
  }),
  z.object({
    document: z.literal("menuitem"),
    type: z.union([
      z.literal("create"),
      z.literal("delete"),
      z.literal("update"),
    ]),
    placeId: z.string(),
    menuitemId: z.string(),
  }),
])

export const ActivitySchema = BaseSchema.and(ActivityAction).and(
  z.object({
    viewerIds: z.array(z.string()),
  }),
)

export type Activity = z.infer<typeof ActivitySchema>
