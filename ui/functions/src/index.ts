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

async function updateUser(user: identity.AuthUserRecord) {
  await admin
    .firestore()
    .doc(`/users/${user.uid}`)
    .set({
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email ?? "",
      emailLowerCase: user.email?.toLowerCase() ?? null,
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
