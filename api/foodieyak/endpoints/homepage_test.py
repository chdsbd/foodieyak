from starlette import status
from starlette.testclient import TestClient

from foodieyak.app import app


def test_signup() -> None:
    with TestClient(app) as client:
        res = client.get(
            "/",
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.text == "Foodieyak API"
