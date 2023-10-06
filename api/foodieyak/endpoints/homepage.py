from starlette.responses import Response, PlainTextResponse
from starlette.requests import Request


async def homepage(request: Request) -> Response:
    return PlainTextResponse("Foodieyak API")
