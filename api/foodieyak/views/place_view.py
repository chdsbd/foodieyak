from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

from starlette.authentication import requires
from starlette.exceptions import HTTPException
from starlette.requests import Request
from starlette.responses import Response

from foodieyak.db import db
from foodieyak.views.responses import JSONResponse

if TYPE_CHECKING:
    from google.cloud.firestore_v1.async_document import AsyncDocumentReference


async def get_place(user_id: str, place_id: str) -> AsyncDocumentReference:
    place = await db.collection("places").document(document_id=place_id).get()
    doc = place.to_dict()
    if not doc or user_id not in doc.get("viewerIds"):
        raise HTTPException(status_code=404)

    return doc


async def get_menu_items(user_id: str, place_id: str):
    menu_items = db.collection("places", place_id, "menuitems").stream()

    res = []
    async for menu_item in menu_items:
        content = menu_item.to_dict()
        res.append({"name": content["name"]})
    return res


async def get_checkins(user_id: str, place_id: str):
    checkins = db.collection("places", place_id, "checkins").stream()

    res = []
    async for checkin in checkins:
        content = checkin.to_dict()

        createdAt = content.get("createdAt")
        if createdAt:
            createdAt = createdAt.isoformat()
        res.append(
            {
                "ratingsMenuItemIds": content["ratingsMenuItemIds"],
                "createdAt": createdAt,
                "createdById": content["createdById"],
                "ratings": content["ratings"],
            }
        )
    return res


@requires("authenticated")
async def place_view(request: Request) -> Response:
    user_id = request.user
    async with asyncio.TaskGroup() as tg:
        place_task = tg.create_task(
            get_place(
                user_id=user_id,
                place_id=request.path_params["place_id"],
            )
        )
        menu_items_task = tg.create_task(
            get_menu_items(
                user_id=user_id,
                place_id=request.path_params["place_id"],
            )
        )
        checkins_task = tg.create_task(
            get_checkins(
                user_id=user_id,
                place_id=request.path_params["place_id"],
            )
        )
    place = place_task.result()
    menu_items = menu_items_task.result()
    checkins = checkins_task.result()

    return JSONResponse(
        {
            "name": place["name"],
            "location": place["location"],
            "menu_items": menu_items,
            "checkins": checkins,
        }
    )
