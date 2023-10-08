with invite := <TeamInvite>$team_invite_id
update Team 
filter .id = invite.team.id
set {
  members += <User>$user_id
};
delete TeamInvite
filter .id = <uuid>$team_invite_id;
