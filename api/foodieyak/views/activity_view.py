import asyncio

from starlette.authentication import requires
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from foodieyak.queries import (
    get_checkins_for_activity,
    get_places,
)


@requires("authenticated")
async def activity_view(request: Request) -> Response:
    user_id = request.user
    async with asyncio.TaskGroup() as tg:
        checkins_task = tg.create_task(get_checkins_for_activity(user_id=user_id))
        places_task = tg.create_task(get_places(user_id=user_id))

    checkins = checkins_task.result()
    places = places_task.result()
    checkins_json = []

    place_map = {}
    async for place in places:
        place_map[place.id] = place.to_dict()
    async for checkin in checkins:
        content = checkin.to_dict()
        checkins_json.append(
            {
                "placeId": content["placeId"],
                "place": {"name": place_map[content["placeId"]]["name"]},
                "checkedInAt": content["checkedInAt"].isoformat(),
            }
        )

    return JSONResponse(checkins_json)
