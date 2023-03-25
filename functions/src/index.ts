import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { defineString } from "firebase-functions/params"

import algoliasearch from "algoliasearch"
import * as identity from "firebase-functions/lib/common/providers/identity"
import { first, uniq } from "lodash"
import { z } from "zod"
import { Timestamp } from "firebase-admin/firestore"
import { Activity, ActivityAction } from "./api-schema"
const algoliaSearchApiKey = defineString("ALGOLIA_SEARCH_API_KEY")

admin.initializeApp()
admin.firestore().settings({ ignoreUndefinedProperties: true })

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true })
  response.send("Hello from Firebase!")
})

export const userOnCreate = functions.auth.user().onCreate((user, context) => {
  // TODO
})

function getAuthId(context: { auth?: { uid: string } }): string {
  return context.auth!.uid
}

async function getFriends({ userId }: { userId: string }): Promise<string[]> {
  const friendDocs = await admin
    .firestore()
    .collection(`/users/${userId}/friends`)
    .get()
  let friendIds: string[] = []
  friendDocs.forEach((doc) => {
    friendIds.push(doc.id)
  })
  return friendIds
}

async function createAuditLog({
  actorId,
  ...rest
}: ActivityAction & {
  actorId: string
}) {
  const friendIds = await getFriends({ userId: actorId })
  const auditLog: Omit<Activity, "id"> & { viewerIds: string[] } = {
    createdById: actorId,
    createdAt: Timestamp.now(),
    lastModifiedAt: Timestamp.now(),
    lastModifiedById: null,
    viewerIds: [actorId, ...friendIds],
    ...rest,
  }
  await admin
    .firestore()
    .collection(`/users/${actorId}/activities`)
    .add(auditLog)
}

/** For each place created by User, add Friend as a viewer. */
async function addFriendToUserPlaces({
  friendId,
  userId,
}: {
  friendId: string
  userId: string
}) {
  const places = await admin
    .firestore()
    .collection(`/places`)
    .where("createdById", "==", userId)
    .get()
  const queries: Promise<unknown>[] = []
  places.forEach((place) => {
    queries.push(
      admin
        .firestore()
        .doc(place.ref.path)
        .update({
          viewerIds: admin.firestore.FieldValue.arrayUnion(friendId),
        }),
    )
  })
  await Promise.all(queries)
}

/** backfill friend into the user's activities */
async function addFriendToActivity({
  friendId,
  userId,
}: {
  friendId: string
  userId: string
}) {
  const activities = await admin
    .firestore()
    .collection(`/users/${userId}/activities`)
    .get()
  const queries: Promise<unknown>[] = []
  activities.forEach((activity) => {
    queries.push(
      admin
        .firestore()
        .doc(activity.ref.path)
        .update({
          viewerIds: admin.firestore.FieldValue.arrayUnion(friendId),
        }),
    )
  })
  await Promise.all(queries)
}

export const friendOnChange = functions.firestore
  .document("/users/{userId}/friends/{friendId}")
  .onWrite(async (change, context) => {
    if (!change.before.exists && change.after.exists) {
      // friend created
    }
    if (!change.after.exists) {
      // friend deleted
      // Update Places
      // TODO: Copy all related check-ins & remove from places
      // await removeFriendFromPlaces({
      //   userId: context.params.userId,
      //   friendId: context.params.friendId,
      // })
      // await removeFriendFromPlaces({
      //   userId: context.params.friendId,
      //   friendId: context.params.userId,
      // })
      // Update Activity
      // await removeFriendFromActivity({
      //   userId: context.params.userId,
      //   friendId: context.params.friendId,
      // })
      // await removeFriendFromActivity({
      //   userId: context.params.friendId,
      //   friendId: context.params.userId,
      // })
    }
    if (change.before.exists && change.after.exists) {
      // friend updated
      if (!change.before.data()?.accepted && change.after.data()?.accepted) {
        // invite accepted. Update checkIns with access.
        await addFriendToUserPlaces({
          userId: context.params.userId,
          friendId: context.params.friendId,
        })
        await addFriendToUserPlaces({
          userId: context.params.friendId,
          friendId: context.params.userId,
        })

        // Add to Activity
        await addFriendToActivity({
          userId: context.params.friendId,
          friendId: context.params.userId,
        })
        await addFriendToActivity({
          userId: context.params.userId,
          friendId: context.params.friendId,
        })
      }
    }
  })

export const placeOnChange = functions.firestore
  .document("/places/{placeId}")
  .onWrite(async (change, context) => {
    const { placeId } = context.params
    if (!change.before.exists && change.after.exists) {
      // created
      const userId = change.after.data()?.createdById
      functions.logger.info({
        change,
        context,
        userId,
      })
      const friendIds: string[] = []
      const friends = await admin
        .firestore()
        .collection(`users/${userId}/friends`)
        .where("accepted", "==", true)
        .get()
      friends.forEach((friend) => {
        friendIds.push(friend.id)
      })
      functions.logger.info({ friendIds })
      await admin
        .firestore()
        .doc(change.after.ref.path)
        .update({
          viewerIds: admin.firestore.FieldValue.arrayUnion(...friendIds),
        })

      await createAuditLog({
        actorId: userId,
        document: "place",
        placeId,
        type: "create",
      })
    }
    if (!change.after.exists) {
      const userId = change.before.data()?.createdById
      // deleted
      await createAuditLog({
        actorId: userId,
        document: "place",
        placeId,
        type: "delete",
      })
    }
    if (change.before.exists && change.after.exists) {
      // updated
      const userId = change.before.data()?.createdById
      await createAuditLog({
        actorId: userId,
        document: "place",
        placeId,
        type: "update",
      })
    }
  })

/** Update our Place-document counts for menuitems and checkins. */
async function updateSubcollectionCounts({ placeId }: { placeId: string }) {
  const menuItemCount = (
    await admin
      .firestore()
      .collection(`/places/${placeId}/menuitems`)
      .count()
      .get()
  ).data().count
  const checkInCount = (
    await admin
      .firestore()
      .collection(`/places/${placeId}/checkins`)
      .count()
      .get()
  ).data().count

  functions.logger.info("counts", { menuItemCount, checkInCount })

  await admin.firestore().doc(`places/${placeId}`).update({
    checkInCount,
    menuItemCount,
  })
}

/**
 * Set the lastVisitedAt field on Place
 */
async function updateLastCheckinAt({ placeId }: { placeId: string }) {
  const lastestCheckIns = await admin
    .firestore()
    .collection(`/places/${placeId}/checkins`)
    .orderBy("checkedInAt", "desc")
    .limit(1)
    .get()
  const lastestCheckIn = first(lastestCheckIns.docs)

  const lastCheckInAt: admin.firestore.Timestamp | undefined | null =
    lastestCheckIn?.data().checkedInAt

  functions.logger.info("checkin", { lastestCheckIn, lastCheckInAt })

  await admin
    .firestore()
    .doc(`places/${placeId}`)
    .update({
      lastVisitedAt: lastCheckInAt ?? null,
    })
}

/** Update MenuItem document with the number of checkins referencing it. */
async function updateUsageCountForMenuItem({
  placeId,
  menuItemId,
}: {
  placeId: string
  menuItemId: string
}) {
  const checkInCount = (
    await admin
      .firestore()
      .collection(`/places/${placeId}/checkins`)
      .where("ratingsMenuItemIds", "array-contains", menuItemId)
      .count()
      .get()
  ).data().count

  functions.logger.info("checkInsWithRatingIds", { checkInCount })

  await admin
    .firestore()
    .doc(`places/${placeId}/menuitems/${menuItemId}`)
    .update({
      checkInCount,
    })
}

async function mergePlaces({
  oldPlaceId,
  targetPlaceId,
  userId,
}: {
  oldPlaceId: string
  targetPlaceId: string
  userId: string
}) {
  const db = admin.firestore()

  await db.runTransaction(async (transaction) => {
    const oldPlace = await transaction.get(db.doc(`/places/${oldPlaceId}`))
    const targetPlace = await transaction.get(
      db.doc(`/places/${targetPlaceId}`),
    )
    const oldPlaceData = oldPlace.data()
    const targetPlaceData = targetPlace.data()

    // if neither place exists, we shouldn't do anything
    if (!oldPlaceData || !targetPlaceData) {
      functions.logger.info("cannot merge places. Missing place", {
        oldPlace,
        targetPlace,
      })
      return
    }

    if (
      !oldPlaceData.viewerIds.includes(userId) ||
      !targetPlaceData.viewerIds.includes(userId)
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "user does not have access to resources",
      )
    }

    const oldMenuItems = await transaction.get(
      db.collection(`/places/${oldPlaceId}/menuitems`),
    )
    const oldCheckins = await transaction.get(
      db.collection(`/places/${oldPlaceId}/checkins`),
    )

    for (const oldMenuItem of oldMenuItems.docs) {
      transaction.set(
        db.doc(`/places/${targetPlaceId}/menuitems/${oldMenuItem.id}`),
        oldMenuItem.data(),
      )
      transaction.delete(oldMenuItem.ref)
    }

    for (const oldCheckin of oldCheckins.docs) {
      transaction.set(
        db.doc(`/places/${targetPlaceId}/checkins/${oldCheckin.id}`),
        oldCheckin.data(),
      )
      transaction.delete(oldCheckin.ref)
    }

    transaction.delete(oldPlace.ref)

    functions.logger.info("copied child documents", {
      checkinCount: oldCheckins.size,
      menuItemCount: oldMenuItems.size,
    })
  })
}

async function updateMenuItemsForCheckIn({
  placeId,
  change,
}: {
  placeId: string
  change: functions.Change<functions.firestore.DocumentSnapshot>
}) {
  const menuItemIds: string[] = uniq([
    ...(change.before.data()?.ratingsMenuItemIds ?? []),
    ...(change.after.data()?.ratingsMenuItemIds ?? []),
  ])
  functions.logger.info("menuItemIds", {
    menuItemIds,
    menuItemIdsLength: menuItemIds.length,
  })

  await Promise.all(
    menuItemIds.map((menuItemId) =>
      updateUsageCountForMenuItem({ placeId, menuItemId }),
    ),
  )
}

const MergePlaceIntoPlaceParams = z.object({
  oldPlaceId: z.string(),
  targetPlaceId: z.string(),
})

export const mergePlaceIntoPlace = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      )
    }
    const res = MergePlaceIntoPlaceParams.safeParse(data)
    if (!res.success) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        JSON.stringify(res.error.flatten()),
      )
    }
    await mergePlaces({
      oldPlaceId: res.data.oldPlaceId,
      targetPlaceId: res.data.targetPlaceId,
      userId: context.auth.uid,
    })
    await createAuditLog({
      actorId: context.auth.uid,
      document: "place",
      type: "merge",
      movedPlaceId: res.data.oldPlaceId,
      placeId: res.data.targetPlaceId,
    })
  },
)

export const checkinOnChange = functions.firestore
  .document("/places/{placeId}/checkins/{checkin}")
  .onWrite(async (change, context) => {
    const { placeId, checkin: checkinId } = context.params
    await updateLastCheckinAt({ placeId })
    if (!change.before.exists && change.after.exists) {
      // create
      await updateSubcollectionCounts({
        placeId,
      })

      const createdById = change.before.data()?.createdById
      await createAuditLog({
        actorId: createdById,
        document: "checkin",
        checkinId,
        placeId,
        type: "create",
      })
    }
    if (!change.after.exists) {
      // delete
      await updateSubcollectionCounts({
        placeId,
      })
      const createdById = change.before.data()?.createdById
      await createAuditLog({
        actorId: createdById,
        document: "checkin",
        checkinId,
        placeId,
        type: "delete",
      })
    }
    if (change.before.exists && change.after.exists) {
      const createdById = change.before.data()?.createdById
      // updated
      await createAuditLog({
        actorId: createdById,
        document: "checkin",
        checkinId,
        placeId,
        type: "update",
      })
    }
    await updateMenuItemsForCheckIn({ change, placeId })
  })
export const menuitemOnChange = functions.firestore
  .document("/places/{placeId}/menuitems/{menuItemId}")
  .onWrite(async (change, context) => {
    const { placeId, menuItemId: menuitemId } = context.params
    if (!change.before.exists && change.after.exists) {
      // create
      await updateSubcollectionCounts({
        placeId,
      })
      const createdById = change.after.data()?.createdById
      await createAuditLog({
        actorId: createdById,
        document: "menuitem",
        menuitemId,
        placeId,
        type: "create",
      })
    }
    if (!change.after.exists) {
      // delete
      await updateSubcollectionCounts({
        placeId,
      })
      const createdById = change.before.data()?.createdById
      await createAuditLog({
        actorId: createdById,
        document: "menuitem",
        menuitemId,
        placeId,
        type: "delete",
      })
    }
    if (change.before.exists && change.after.exists) {
      const createdById = change.before.data()?.createdById
      // updated
      await createAuditLog({
        actorId: createdById,
        document: "menuitem",
        menuitemId,
        placeId,
        type: "update",
      })
    }
  })

async function updateUser(user: identity.AuthUserRecord) {
  await admin
    .firestore()
    .doc(`/users/${user.uid}`)
    .set({
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email ?? "",
      emailLowerCase: user.email?.toLowerCase() ?? null,
      createdAt: new Date(),
    })
}

async function setAlgoliaKeyForUser({ userId }: { userId: string }) {
  const publicKey = algoliasearch("", "").generateSecuredApiKey(
    algoliaSearchApiKey.value(),
    {
      filters: `viewerIds:${userId}`,
    },
  )
  await admin
    .firestore()
    .doc(`/users/${userId}/private_user_info/${userId}`)
    .set({ algoliaSearchApiKey: publicKey }, { merge: true })
}

export const userBeforeCreate = functions.auth
  .user()
  .beforeCreate(async (user, context) => {
    await setAlgoliaKeyForUser({ userId: user.uid })
    await updateUser(user)
  })
