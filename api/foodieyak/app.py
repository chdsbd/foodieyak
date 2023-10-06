import edgedb
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.routing import Route

from foodieyak.middleware.session import SessionMiddleware
from foodieyak.endpoints.homepage import homepage
from foodieyak.endpoints.login import login
from foodieyak.endpoints.signup import signup
from foodieyak.endpoints.team_create import team_create


def on_startup():
    app.state.client = edgedb.create_async_client(
        database="edgedb",
    )


app = Starlette(
    debug=True,
    routes=[
        Route("/", homepage),
        Route("/team", team_create, methods=["POST"]),
        Route("/login", login, methods=["POST"]),
        Route("/signup", signup, methods=["POST"]),
    ],
    middleware=[Middleware(SessionMiddleware)],
    on_startup=[on_startup],
)
