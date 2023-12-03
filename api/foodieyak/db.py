import firebase_admin
from firebase_admin import firestore_async

# credentials pulled from resource service account.
firebase_admin.initialize_app()

db = firestore_async.client()
