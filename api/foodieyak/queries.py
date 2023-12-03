from __future__ import annotations

from typing import TYPE_CHECKING

from starlette.exceptions import HTTPException
from starlette.requests import Request

from foodieyak.db import db

if TYPE_CHECKING:
    from collections.abc import AsyncIterator

    from google.cloud.firestore_v1.async_document import AsyncDocumentReference
    from google.cloud.firestore_v1.base_document import DocumentSnapshot


async def get_place(user_id: str, place_id: str) -> AsyncDocumentReference:
    place = await db.collection("places").document(document_id=place_id).get()
    doc = place.to_dict()
    if not doc or user_id not in doc.get("viewerIds"):
        raise HTTPException(status_code=404)

    return doc


async def get_places(user_id: str) -> AsyncIterator[DocumentSnapshot]:
    checkins_ref = db.collection("places")
    return (
        checkins_ref.where("viewerIds", "array_contains", user_id)
        .order_by("name", "ASCENDING")
        .stream()
    )


async def get_user_from_session(request: Request) -> str | None:
    session_id = request.cookies.get("__session")
    if not session_id:
        return None

    session = await db.collection("auth_sessions").document(session_id).get()
    if not session.exists:
        return None
    session_data = session.to_dict()
    return session_data.get("user_id")


async def get_checkins_for_activity(user_id: str) -> AsyncIterator[DocumentSnapshot]:
    """
    Return all checkin activity that is visible to user.
    """
    checkins_ref = db.collection_group("checkins")
    return (
        checkins_ref.where("viewerIds", "array_contains", user_id)
        .order_by("checkedInAt", "DESCENDING")
        .limit(25)
        .stream()
    )
