import { Timestamp } from "firebase/firestore";
import { z } from "zod";
const TimestampSchema = z
  .object({
    seconds: z.number(),
    nanoseconds: z.number(),
  })
  .transform((x) => {
    return new Timestamp(x.seconds, x.nanoseconds);
  });
const BaseSchema = z.object({
  id: z.string(),
  createdById: z.string(),
  createdAt: TimestampSchema,
  lastModifiedById: z.nullable(z.string()),
  lastModifiedAt: z.nullable(TimestampSchema),
});

export const UserSchema = z.object({
  uid: z.string(),
  displayName: z.nullable(z.string()),
  email: z.string(),
  emailLookupField: z.optional(z.string()),
});

export type User = z.infer<typeof UserSchema>;

export const PlaceSchema = BaseSchema.extend({
  name: z.string(),
  location: z.string(),
  viewerIds: z.array(z.string()),
  menuItemCount: z.nullable(z.number()),
  checkInCount: z.nullable(z.number()),
});
export type Place = z.infer<typeof PlaceSchema>;

export const PlaceMenuItemSchema = BaseSchema.extend({
  name: z.string(),
});
export type PlaceMenuItem = z.infer<typeof PlaceMenuItemSchema>;

export const PlaceCheckInSchema = BaseSchema.extend({
  ratings: z.array(
    z.object({
      id: z.string(),
      menuItemId: z.string(),
      rating: z.literal(-1).or(z.literal(1)),
    })
  ),
});
export type PlaceCheckIn = z.infer<typeof PlaceCheckInSchema>;
export type CheckInRating = PlaceCheckIn["ratings"][0];

export const FriendSchema = BaseSchema.extend({
  accepted: z.boolean(),
  acceptedAt: z.nullable(TimestampSchema),
});

export type Friend = z.infer<typeof FriendSchema>;