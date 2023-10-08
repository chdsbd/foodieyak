with new_invite := (insert TeamInvite {
  sender :=  <User>$sender_id,
  recipient := <User>$recipient_id,
  team := <Team>$team_id
}) 
select new_invite {
  sender,
  recipient,
  team,
}
