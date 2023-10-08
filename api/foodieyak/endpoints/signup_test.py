from uuid import uuid4

from starlette import status
from starlette.testclient import TestClient

from foodieyak.app import app


def test_signup() -> None:
    with TestClient(app) as client:
        payload = {"email": f"j.doe+{uuid4().hex}@example.com", "password": uuid4().hex}
        signup_res = client.post(
            "/signup",
            json=payload,
        )
        assert signup_res.status_code == status.HTTP_200_OK

        user_res = client.get("/me")
        assert user_res.status_code == status.HTTP_200_OK
        assert user_res.json()["id"] == signup_res.json()["id"]
        assert (
            user_res.json()["email"] == signup_res.json()["email"] == payload["email"]
        )
        assert user_res.json()["name"] == user_res.json()["email"]


def test_signup_invalid_requirements() -> None:
    with TestClient(app) as client:
        payload = {
            "email": f"j.doe+{uuid4().hex}@example.com",
            "password": uuid4().hex[:7],
        }
        signup_res = client.post(
            "/signup",
            json=payload,
        )
        assert signup_res.status_code == status.HTTP_400_BAD_REQUEST
        assert signup_res.json()["code"] == "password_too_short"
