import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as identity from "firebase-functions/lib/common/providers/identity";

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const userOnCreate = functions.auth.user().onCreate((user, context) => {
  // TODO
});

/** For each place created by User, add Friend as a viewer. */
async function addFriendToUserPlaces({
  friendId,
  userId,
}: {
  friendId: string;
  userId: string;
}) {
  const places = await admin
    .firestore()
    .collection(`/places`)
    .where("createdById", "==", userId)
    .get();
  const queries: Promise<unknown>[] = [];
  places.forEach((place) => {
    queries.push(
      admin
        .firestore()
        .doc(place.ref.path)
        .update({
          viewerIds: admin.firestore.FieldValue.arrayUnion(friendId),
        })
    );
  });
  await Promise.all(queries);
}

export const friendOnChange = functions.firestore
  .document("/users/{userId}/friends/{friendId}")
  .onWrite(async (change, context) => {
    if (!change.before.exists && change.after.exists) {
      // friend created
    }
    if (!change.after.exists) {
      // friend deleted
      // TODO: Copy all related check-ins
    }
    if (change.before.exists && change.after.exists) {
      // friend updated
      if (!change.before.data()?.accepted && change.after.data()?.accepted) {
        // invite accepted. Update checkIns with access.
        await addFriendToUserPlaces({
          userId: context.params.userId,
          friendId: context.params.friendId,
        });
        await addFriendToUserPlaces({
          userId: context.params.friendId,
          friendId: context.params.userId,
        });
      }
    }
  });
export const placeOnChange = functions.firestore
  .document("/places/{placeId}")
  .onWrite(async (change, context) => {
    if (!change.before.exists && change.after.exists) {
      // created
      const userId = change.after.data()?.createdById;
      functions.logger.info({
        change,
        context,
        userId,
      });
      const friendIds: string[] = [];
      const friends = await admin
        .firestore()
        .collection(`users/${userId}/friends`)
        .where("accepted", "==", true)
        .get();
      friends.forEach((friend) => {
        friendIds.push(friend.id);
      });
      functions.logger.info({ friendIds });
      await admin
        .firestore()
        .doc(change.after.ref.path)
        .update({
          viewerIds: admin.firestore.FieldValue.arrayUnion(...friendIds),
        });
    }
    if (!change.after.exists) {
      // deleted
    }
    if (change.before.exists && change.after.exists) {
      //  updated
    }
  });

/** Update our Place-document counts for menuitems and checkins. */
async function updateSubcollectionCounts({ placeId }: { placeId: string }) {
  const menuItemCount = (
    await admin
      .firestore()
      .collection(`/places/${placeId}/menuitems`)
      .count()
      .get()
  ).data().count;
  const checkInCount = (
    await admin
      .firestore()
      .collection(`/places/${placeId}/checkins`)
      .count()
      .get()
  ).data().count;

  await admin.firestore().doc(`places/${placeId}`).update({
    checkInCount,
    menuItemCount,
  });
}

export const checkinOnChange = functions.firestore
  .document("/places/{placeId}/checkins/{checkin}")
  .onWrite(async (change, context) => {
    const { placeId } = context.params;
    if (!change.before.exists && change.after.exists) {
      await updateSubcollectionCounts({
        placeId,
      });
    }
    if (!change.after.exists) {
      await updateSubcollectionCounts({
        placeId,
      });
    }
    if (change.before.exists && change.after.exists) {
      //  updated
    }
  });
export const menuitemOnChange = functions.firestore
  .document("/places/{placeId}/menuitems/{menuItemId}")
  .onWrite(async (change, context) => {
    const { placeId } = context.params;
    if (!change.before.exists && change.after.exists) {
      await updateSubcollectionCounts({
        placeId,
      });
    }
    if (!change.after.exists) {
      await updateSubcollectionCounts({
        placeId,
      });
    }
    if (change.before.exists && change.after.exists) {
      //  updated
    }
  });

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
    });
}

export const userBeforeCreate = functions.auth
  .user()
  .beforeCreate(async (user, context) => {
    await updateUser(user);
  });

export const userBeforeSignIn = functions.auth
  .user()
  .beforeSignIn(async (user, context) => {
    await updateUser(user);
  });
