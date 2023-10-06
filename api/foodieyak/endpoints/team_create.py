from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.authentication import requires

from foodieyak.queries.create_team_async_edgeql import create_team


@requires("authenticated", status_code=401)
async def team_create(request: Request) -> JSONResponse:
    client = request.app.state.client
    body = await request.json()

    team = await create_team(client, name=body["name"], user_id=request.user.id)
    return JSONResponse({"id": str(team.id), "name": team.name})
