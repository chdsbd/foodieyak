from typing import Protocol

from starlette.authentication import (
    AuthCredentials,
    UnauthenticatedUser,
)
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from foodieyak.queries import get_user_from_session


class _RequestHandler(Protocol):
    def __call__(self, request: Request) -> Response:
        ...


class SessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: _RequestHandler) -> Response:
        session_id = request.cookies.get("session_id")
        request.scope["auth"] = AuthCredentials()
        request.scope["user"] = UnauthenticatedUser()
        if session_id:
            user_id = await get_user_from_session(request)
            if user_id:
                request.scope["auth"] = AuthCredentials(["authenticated"])
                request.scope["user"] = user_id
        return await call_next(request)
