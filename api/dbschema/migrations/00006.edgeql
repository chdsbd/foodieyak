CREATE MIGRATION m1g5gvco6gxb7ppjrfedy2fbyeuczrkohukdkupx3qelbofaowrl4a
    ONTO m1bia5zteq5hdtbeum5eegr6dsgg3s7t4nm3vehse2ev2jorsynbjq
{
  ALTER TYPE foodieyak::Team {
      CREATE MULTI LINK places: foodieyak::Place;
  };
};
