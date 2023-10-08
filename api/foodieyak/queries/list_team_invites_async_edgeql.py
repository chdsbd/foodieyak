# AUTOGENERATED FROM 'foodieyak/queries/list_team_invites.edgeql' WITH:
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
class ListTeamInvitesResult(NoPydanticValidation):
    id: uuid.UUID
    sender: ListTeamInvitesResultSender
    recipient: ListTeamInvitesResultSender
    team: ListTeamInvitesResultTeam


@dataclasses.dataclass
class ListTeamInvitesResultSender(NoPydanticValidation):
    id: uuid.UUID


@dataclasses.dataclass
class ListTeamInvitesResultTeam(NoPydanticValidation):
    id: uuid.UUID


async def list_team_invites(
    executor: edgedb.AsyncIOExecutor,
    *,
    user_id: uuid.UUID,
) -> list[ListTeamInvitesResult]:
    return await executor.query(
        """\
        with u := <User>$user_id
        select TeamInvite {
          sender ,
          recipient ,
          team ,
        }
        filter 
          .sender = u
          OR .recipient = u\
        """,
        user_id=user_id,
    )
