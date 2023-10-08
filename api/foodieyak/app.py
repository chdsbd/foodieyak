import contextlib
from typing import AsyncIterator, TypedDict

import edgedb
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.routing import Route

from foodieyak.endpoints.current_user import current_user
from foodieyak.endpoints.homepage import homepage
from foodieyak.endpoints.login import login
from foodieyak.endpoints.signup import signup
from foodieyak.endpoints.team_create import team_create
from foodieyak.endpoints.team_invite_accept import team_invite_accept
from foodieyak.endpoints.team_invite_create import team_invite_create
from foodieyak.endpoints.team_invite_list import team_invite_list
from foodieyak.middleware.session import SessionMiddleware


class State(TypedDict):
    client: edgedb.AsyncIOClient


@contextlib.asynccontextmanager
async def lifespan(app: Starlette) -> AsyncIterator[State]:
    async with edgedb.create_async_client(
        database="edgedb",
    ) as client:
        yield {"client": client}


app = Starlette(
    debug=True,
    routes=[
        Route("/", homepage),
        Route("/me", current_user, methods=["GET"]),
        Route("/team", team_create, methods=["POST"]),
        Route("/team-invite", team_invite_create, methods=["POST"]),
        Route("/team-invite", team_invite_list, methods=["GET"]),
        Route("/team-invite-accept", team_invite_accept, methods=["POST"]),
        Route("/login", login, methods=["POST"]),
        Route("/signup", signup, methods=["POST"]),
    ],
    middleware=[Middleware(SessionMiddleware)],
    lifespan=lifespan,
)
