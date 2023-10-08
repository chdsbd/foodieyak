from uuid import uuid4

from starlette import status
from starlette.testclient import TestClient

from foodieyak.app import app


def test_login() -> None:
    with TestClient(app) as client:
        # create user.
        payload = {"email": f"j.doe+{uuid4().hex}@example.com", "password": uuid4().hex}
        signup_res = client.post(
            "/signup",
            json=payload,
        )
        assert signup_res.status_code == status.HTTP_200_OK

        # invalid password.
        login_res = client.post(
            "/login", json={"email": payload["email"], "password": "wrong-password"}
        )
        assert login_res.status_code == status.HTTP_400_BAD_REQUEST
        assert login_res.json()["code"] == "invalid_password"
        assert login_res.json()["message"] == "The provided password is incorrect."

        # correct password.
        login_res = client.post(
            "/login",
            json=payload,
        )
        assert login_res.status_code == status.HTTP_200_OK


def test_login_missing_user() -> None:
    with TestClient(app) as client:
        # no matching user email
        payload = {"email": f"j.doe+{uuid4().hex}@example.com", "password": uuid4().hex}
        res = client.post("/login", json=payload)
        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert res.json()["code"] == "no_user_with_email"
        assert res.json()["message"] == "No user found for provided email."
