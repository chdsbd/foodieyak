from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.authentication import requires

from foodieyak.queries.list_team_invites_async_edgeql import list_team_invites


@requires("authenticated", status_code=401)
async def team_invite_list(request: Request) -> JSONResponse:
    client = request.app.state.client
    team_invites = await list_team_invites(client, user_id=request.user.id)
    return JSONResponse(
        [
            {
                "id": str(team_invite.id),
                "team": str(team_invite.team.id),
                "sender": str(team_invite.sender.id),
                "recipient": str(team_invite.recipient.id),
            }
            for team_invite in team_invites
        ]
    )
