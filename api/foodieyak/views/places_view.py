from starlette.authentication import requires
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from foodieyak.queries import get_places


@requires("authenticated")
async def places_view(request: Request) -> Response:
    user_id = request.user
    places = await get_places(user_id=user_id)

    checkins_json = []
    async for place in places:
        content = place.to_dict()
        is_skippable_at = content.get("isSkippableAt")
        if is_skippable_at:
            is_skippable_at = is_skippable_at.isoformat()
        checkins_json.append(
            {
                "name": content["name"],
                "location": content["location"],
                "isSkippableAt": is_skippable_at,
            }
        )

    return JSONResponse(checkins_json)
