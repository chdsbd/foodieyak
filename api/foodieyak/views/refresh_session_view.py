from __future__ import annotations

import asyncio
from datetime import timedelta

from firebase_admin import auth
from pydantic import BaseModel
from starlette.requests import Request
from starlette.responses import Response

from foodieyak.queries import create_session
from foodieyak.views.responses import JSONResponse


class RefreshSessionParams(BaseModel):
    idToken: str


async def refresh_sesssion_view(request: Request) -> Response:
    body = RefreshSessionParams.model_validate_json(await request.body())
    loop = asyncio.get_running_loop()

    try:
        # this makes network calls for Google JWT certs.
        token_contents = await loop.run_in_executor(
            None, auth.verify_id_token, body.idToken
        )
    except auth.ExpiredIdTokenError:
        res = JSONResponse({})
        res.delete_cookie("__session")
        return res

    res = JSONResponse({})

    session_id = await create_session(user_id=token_contents["uid"])
    res.set_cookie(
        "__session",
        value=session_id,
        httponly=True,
        max_age=int(timedelta(days=14).total_seconds()),
    )

    return res
