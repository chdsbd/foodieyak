with new_user := (insert User {
  email := <str>$email,
  password_hash := <str>$password_hash
}) 
select new_user {
  email
}
