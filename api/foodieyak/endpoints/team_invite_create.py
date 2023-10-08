from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.authentication import requires

from foodieyak.queries.create_team_invite_async_edgeql import create_team_invite


@requires("authenticated", status_code=401)
async def team_invite_create(request: Request) -> JSONResponse:
    client = request.app.state.client
    body = await request.json()
    recipient_id = body["recipient_id"]
    team_id = body["team_id"]

    team_invite = await create_team_invite(
        client, sender_id=request.user.id, recipient_id=recipient_id, team_id=team_id
    )
    return JSONResponse(
        {
            "id": str(team_invite.id),
            "team": str(team_invite.team.id),
            "sender": str(team_invite.sender.id),
            "recipient": str(team_invite.recipient.id),
        }
    )
