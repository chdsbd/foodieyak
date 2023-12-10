from __future__ import annotations

from starlette.requests import Request
from starlette.responses import Response

from foodieyak.views.responses import JSONResponse


async def logout_view(request: Request) -> Response:
    res = JSONResponse({})
    res.delete_cookie("__session")
    return res
