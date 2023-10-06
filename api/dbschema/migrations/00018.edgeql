CREATE MIGRATION m1emwxjrm5vcfi6xs2tjkswsm47etaepbbqmmx7gndaq6dexvn2cgq
    ONTO m1w7ohreon6ggdkhda2eyhnztun7n62nnptie7oxdc656x5vri3oeq
{
  ALTER TYPE foodieyak::Place {
      ALTER ACCESS POLICY team_member_has_access USING (((GLOBAL foodieyak::current_user IN .<places[IS foodieyak::Team].members.id) ?? false));
  };
};
