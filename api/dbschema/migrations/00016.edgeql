CREATE MIGRATION m1eeigdymga6bwxg6oofigl5ap23tqnvrza3umwb3hu5e42rvkfwuq
    ONTO m1y6acbmru2tjqi3wg23fdrihrzauuedqoengmxce3g36nxfk63oma
{
  CREATE GLOBAL foodieyak::current_user -> std::uuid;
  DROP TYPE default::Movie;
  DROP TYPE default::Person;
  ALTER TYPE foodieyak::Team {
      ALTER LINK places {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
