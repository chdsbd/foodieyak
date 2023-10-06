select User {
  email,
  password_hash,
}
filter .email = str_lower(<str>$email)
limit 1
