with u := <User>$user_id
select TeamInvite {
  sender ,
  recipient ,
  team ,
}
filter 
  .sender = u
  OR .recipient = u
