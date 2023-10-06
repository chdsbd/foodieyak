with session := (insert Session {
  user := (select User filter .id = <uuid>$user_id)
}) 
select session {key}
