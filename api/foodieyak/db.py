import firebase_admin
from firebase_admin import firestore_async

from foodieyak import config

firebase_admin.initialize_app(config.FIREBASE_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)

db = firestore_async.client()
