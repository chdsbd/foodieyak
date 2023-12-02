from __future__ import annotations
from starlette.responses import JSONResponse as StarletteJSONResponse
from typing import TYPE_CHECKING, Mapping

if TYPE_CHECKING:
    from starlette.background import BackgroundTask


class JSONResponse(StarletteJSONResponse):
    def __init__(
        self,
        content: object,
        status_code: int = 200,
        headers: Mapping[str, str] | None = None,
        media_type: str | None = None,
        background: BackgroundTask | None = None,
    ) -> None:
        if media_type is None:
            # charset must be set to utf-8.
            media_type = "application/json; charset=utf-8"
        super().__init__(content, status_code, headers, media_type, background)
