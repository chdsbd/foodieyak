with new_team := (insert Team {
  name := <str>$name,
  members := (select User filter .id = <uuid>$user_id limit 1)
}) 
select new_team {
  name
}
