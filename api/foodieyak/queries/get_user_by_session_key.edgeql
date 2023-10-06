select User {
  email
}
filter .<user[is Session].key = <uuid>$session_key
limit 1;
