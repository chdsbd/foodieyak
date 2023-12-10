from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.responses import JSONResponse
from starlette.routing import Route

from foodieyak.middleware import SessionMiddleware
from foodieyak.views.activity_view import activity_view
from foodieyak.views.logout_view import logout_view
from foodieyak.views.place_view import place_view
from foodieyak.views.places_view import places_view
from foodieyak.views.refresh_session_view import refresh_sesssion_view


async def homepage(request):
    return JSONResponse({"hello": "world"})


app = Starlette(
    routes=[
        Route("/", homepage),
        Route("/api", homepage),
        Route("/api/activity", activity_view, methods=["GET"]),
        Route("/api/refresh_session", refresh_sesssion_view, methods=["POST"]),
        Route("/api/logout", logout_view, methods=["POST"]),
        Route("/api/places", places_view, methods=["GET"]),
        Route("/api/places/{place_id}", place_view, methods=["GET"]),
    ],
    middleware=[Middleware(SessionMiddleware)],
)
