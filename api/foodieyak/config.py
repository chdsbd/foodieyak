import json

from firebase_admin import credentials
from starlette.config import Config

config = Config(".env")

FIREBASE_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS = credentials.Certificate(
    json.loads(config("FIREBASE_GOOGLE_SERVICE_ACCOUNT_CERTIFICATE"))
)
