from starlette.requests import Request
from starlette.responses import PlainTextResponse
from starlette.authentication import requires

from foodieyak.queries.accept_team_invite_async_edgeql import accept_team_invite


@requires("authenticated", status_code=401)
async def team_invite_accept(request: Request) -> PlainTextResponse:
    client = request.state.client
    body = await request.json()
    team_invite_id = body["team_invite_id"]

    await accept_team_invite(
        client, user_id=request.user.id, team_invite_id=team_invite_id
    )
    return PlainTextResponse()
