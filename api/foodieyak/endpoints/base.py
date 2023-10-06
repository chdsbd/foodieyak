from starlette.responses import JSONResponse


class ClientErrorResponse(JSONResponse):
    def __init__(self, *, code: str, message: str) -> None:
        super().__init__(
            {
                "error": True,
                "code": code,
                "message": message,
            },
            status_code=400,
        )
