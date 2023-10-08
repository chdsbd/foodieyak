from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from foodieyak.queries.get_user_by_session_key_async_edgeql import (
    get_user_by_session_key,
)
from typing_extensions import Protocol
from starlette.authentication import (
    AuthCredentials,
    UnauthenticatedUser,
)


class _RequestHandler(Protocol):
    def __call__(self, request: Request) -> Response:
        ...


class SessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: _RequestHandler) -> Response:
        client = request.state.client
        session_id = request.cookies.get("session_id")
        request.scope["auth"] = AuthCredentials()
        request.scope["user"] = UnauthenticatedUser()
        if session_id:
            user = await get_user_by_session_key(client, session_key=session_id)
            if user:
                request.scope["auth"] = AuthCredentials(["authenticated"])
                request.scope["user"] = user
        return await call_next(request)
