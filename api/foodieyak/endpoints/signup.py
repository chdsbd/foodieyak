from starlette.responses import JSONResponse
from starlette.requests import Request
from foodieyak.queries.create_user_async_edgeql import create_user
from foodieyak.queries.create_session_async_edgeql import create_session

from foodieyak.auth import hash_password
from foodieyak.endpoints.base import ClientErrorResponse


async def signup(request: Request) -> JSONResponse:
    client = request.app.state.client
    body = await request.json()
    email = body["email"]
    password = body["password"].strip()

    if len(password) < 8:
        return ClientErrorResponse(
            code="password_too_short",
            message="The password is short. Passwords should be at least eight characters long.",
        )

    password_hash = hash_password(secret=password)
    user = await create_user(client, email=email, password_hash=password_hash)

    session = await create_session(client, user_id=user.id)
    res = JSONResponse({"id": str(user.id), "email": user.email})
    res.set_cookie("session_id", session.key)
    return res
