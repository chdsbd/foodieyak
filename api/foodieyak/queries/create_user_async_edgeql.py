# AUTOGENERATED FROM 'foodieyak/queries/create_user.edgeql' WITH:
#     $ edgedb-py


from __future__ import annotations

import dataclasses
import uuid

import edgedb


class NoPydanticValidation:
    @classmethod
    def __get_validators__(cls):
        from pydantic.dataclasses import dataclass as pydantic_dataclass
        pydantic_dataclass(cls)
        cls.__pydantic_model__.__get_validators__ = lambda: []
        return []


@dataclasses.dataclass
class CreateUserResult(NoPydanticValidation):
    id: uuid.UUID
    email: str


async def create_user(
    executor: edgedb.AsyncIOExecutor,
    *,
    email: str,
    password_hash: str,
) -> CreateUserResult:
    return await executor.query_single(
        """\
        with new_user := (insert User {
          email := <str>$email,
          password_hash := <str>$password_hash
        }) 
        select new_user {
          email
        }\
        """,
        email=email,
        password_hash=password_hash,
    )
