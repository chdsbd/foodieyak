from passlib.context import CryptContext


_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(*, secret: str, hash: str) -> bool:
    return _pwd_context.verify(secret=secret, hash=hash)


def hash_password(*, secret: str) -> str:
    return _pwd_context.hash(secret=secret)
