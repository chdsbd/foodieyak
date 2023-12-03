import json

from firebase_admin import credentials
from starlette.config import Config

config = Config(".env")

GOOGLE_SERVICE_ACCOUNT_CERTIFICATE_JSON = config(
    "GOOGLE_SERVICE_ACCOUNT_CERTIFICATE_JSON", default=None
)
FIREBASE_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS = (
    credentials.Certificate(json.loads(GOOGLE_SERVICE_ACCOUNT_CERTIFICATE_JSON))
    if GOOGLE_SERVICE_ACCOUNT_CERTIFICATE_JSON
    else None
)
