from starlette.authentication import requires
from starlette.requests import Request
from starlette.responses import JSONResponse


@requires("authenticated", status_code=401)
async def current_user(request: Request) -> JSONResponse:
    user = request.user

    return JSONResponse({"id": str(user.id), "name": user.name, "email": user.email})
