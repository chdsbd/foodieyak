CREATE MIGRATION m1bia5zteq5hdtbeum5eegr6dsgg3s7t4nm3vehse2ev2jorsynbjq
    ONTO m1ozqnaycmbvxvxyuzgisoqu7nuzsjq6rcxmrdxrqz7joqcfdgcmrq
{
  CREATE TYPE foodieyak::Team EXTENDING foodieyak::Base {
      CREATE MULTI LINK members: foodieyak::User;
      CREATE PROPERTY name: std::str;
  };
  ALTER TYPE foodieyak::User {
      ALTER PROPERTY displayName {
          RENAME TO name;
      };
  };
};
