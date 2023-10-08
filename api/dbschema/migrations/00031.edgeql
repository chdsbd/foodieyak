CREATE MIGRATION m1ktmy4aifhhhjk44gzlf6cifhjxa6v7sb5ajohfv62dit7n2ll44q
    ONTO m1uvy3he3z3pnj6hmdygc4kaakuoypvitjjpwb7uwgepb7ny4nwola
{
  CREATE TYPE default::TeamInvite EXTENDING default::Base {
      CREATE REQUIRED LINK recipient: default::User;
      CREATE REQUIRED LINK sender: default::User;
      CREATE REQUIRED LINK team: default::Team;
  };
};
