import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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

export const userBeforeCreate = functions.auth
  .user()
  .beforeCreate(async (user, context) => {
    await admin
      .firestore()
      .doc(`/users/${user.uid}`)
      .set({
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email,
      });
  });

export const userBeforeSignIn = functions.auth
  .user()
  .beforeSignIn(async (user, context) => {
    await admin
      .firestore()
      .doc(`/users/${user.uid}`)
      .set({
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email,
      });
  });
