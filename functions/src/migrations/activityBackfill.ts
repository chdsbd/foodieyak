// ran with:
// ./node_modules/.bin/esbuild src/migrations/activityBackfill.ts --bundle --minify --sourcemap --platform=node --target=node16 --outfile=build/activityBackfill.js && node build/activityBackfill.js

import * as admin from "firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

import { Activity, ActivityAction } from "../api-schema"

const config = {
  credential: admin.credential.cert(
    "foodieyak-ef36d-firebase-adminsdk-mqdva-741a2ec45f.json",
  ),
}

admin.initializeApp(config)

const db = admin.firestore()

async function getFriends({ userId }: { userId: string }): Promise<string[]> {
  const friendDocs = await admin
    .firestore()
    .collection(`/users/${userId}/friends`)
    .get()
  const friendIds: string[] = []
  friendDocs.forEach((doc) => {
    friendIds.push(doc.id)
  })
  return friendIds
}

async function createAuditLog({
  actorId,
  createdAt,
  ...rest
}: ActivityAction & {
  actorId: string
  createdAt: Timestamp
}) {
  const friendIds = await getFriends({ userId: actorId })
  const auditLog: Omit<Activity, "id"> & { viewerIds: string[] } = {
    createdById: actorId,
    createdAt,
    lastModifiedAt: createdAt,
    lastModifiedById: null,
    viewerIds: [actorId, ...friendIds],
    deleted: false,
    ...rest,
  }
  await admin.firestore().collection(`/activities`).add(auditLog)
}

async function backfillPlacesAndCheckinsAndMenuitems() {
  const places = await db.collection("places").orderBy("createdAt").get()
  await Promise.all(
    places.docs.map(async (place) => {
      const placeId = place.id
      await createAuditLog({
        actorId: place.data().createdById,
        document: "place",
        type: "create",
        placeId,
        createdAt: place.data().createdAt,
      })

      const checkins = await db
        .collection(`places/${placeId}/checkins`)
        .orderBy("createdAt")
        .get()
      await Promise.all(
        checkins.docs.map(async (checkin) => {
          await createAuditLog({
            actorId: checkin.data().createdById,
            document: "checkin",
            type: "create",
            placeId,
            checkinId: checkin.id,
            createdAt: checkin.data().createdAt,
          })
        }),
      )

      const menuitems = await db
        .collection(`/places/${placeId}/menuitems`)
        .orderBy("createdAt")
        .get()
      await Promise.all(
        menuitems.docs.map(async (menuitem) => {
          const menuitemId = menuitem.id
          await createAuditLog({
            actorId: menuitem.data().createdById,
            document: "menuitem",
            type: "create",
            placeId,
            menuitemId,
            createdAt: menuitem.data().createdAt,
          })
        }),
      )
    }),
  )
}

async function main() {
  await backfillPlacesAndCheckinsAndMenuitems()
}

main().catch((e) => {
  console.error(e)
})
