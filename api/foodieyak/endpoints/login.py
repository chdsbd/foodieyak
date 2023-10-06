from starlette.responses import JSONResponse
from starlette.requests import Request
from foodieyak.queries.get_user_by_email_async_edgeql import get_user_by_email
from foodieyak.queries.create_session_async_edgeql import create_session

from foodieyak.auth import verify_password
from foodieyak.endpoints.base import ClientErrorResponse


async def login(request: Request) -> JSONResponse:
    client = request.app.state.client
    body = await request.json()
    email = body["email"]
    password = body["password"].strip()
    user = await get_user_by_email(client, email=email)
    if user is None:
        return ClientErrorResponse(
            code="no_user_with_email", message="No user found for provided email."
        )
    if not verify_password(secret=password, hash=user.password_hash):
        return ClientErrorResponse(
            code="invalid_password", message="The provided password is incorrect."
        )

    session = await create_session(client, user_id=user.id)

    res = JSONResponse({"id": str(user.id), "email": user.email})
    res.set_cookie("session_id", session.key, httponly=True, secure=True)
    return res
