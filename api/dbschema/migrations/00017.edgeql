CREATE MIGRATION m1w7ohreon6ggdkhda2eyhnztun7n62nnptie7oxdc656x5vri3oeq
    ONTO m1eeigdymga6bwxg6oofigl5ap23tqnvrza3umwb3hu5e42rvkfwuq
{
  ALTER TYPE foodieyak::Place {
      CREATE MULTI LINK users := (.<places[IS foodieyak::Team].members);
      CREATE ACCESS POLICY team_member_has_access
          ALLOW ALL USING (((GLOBAL foodieyak::current_user IN .users.id) ?? false));
  };
};
