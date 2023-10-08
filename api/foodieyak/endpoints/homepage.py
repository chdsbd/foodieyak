from starlette.requests import Request
from starlette.responses import PlainTextResponse, Response


async def homepage(request: Request) -> Response:
    return PlainTextResponse("Foodieyak API")
