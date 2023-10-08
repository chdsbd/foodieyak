# AUTOGENERATED FROM 'foodieyak/queries/accept_team_invite.edgeql' WITH:
#     $ edgedb-py


from __future__ import annotations
import dataclasses
import edgedb
import uuid


class NoPydanticValidation:
    @classmethod
    def __get_validators__(cls):
        from pydantic.dataclasses import dataclass as pydantic_dataclass
        pydantic_dataclass(cls)
        cls.__pydantic_model__.__get_validators__ = lambda: []
        return []


@dataclasses.dataclass
class AcceptTeamInviteResult(NoPydanticValidation):
    id: uuid.UUID


async def accept_team_invite(
    executor: edgedb.AsyncIOExecutor,
    *,
    team_invite_id: uuid.UUID,
    user_id: uuid.UUID,
) -> AcceptTeamInviteResult | None:
    return await executor.query_single(
        """\
        with invite := <TeamInvite>$team_invite_id
        update Team 
        filter .id = invite.team.id
        set {
          members += <User>$user_id
        };
        delete TeamInvite
        filter .id = <uuid>$team_invite_id;\
        """,
        team_invite_id=team_invite_id,
        user_id=user_id,
    )
