CREATE MIGRATION m1ef5ggtgt5p5tfvplctcjlhyyd2sn3s5gotznqe5avytxldhx6a3a
    ONTO m1ub7xtvi2kcb2oohkdmh2zh554cmroboqkambsoshsqh6z3yvtapq
{
  ALTER TYPE default::User {
      ALTER PROPERTY name {
          DROP REWRITE
              INSERT ;
          };
      };
  ALTER TYPE default::User {
      ALTER PROPERTY name {
          CREATE REWRITE
              INSERT 
              USING ((__subject__.name ?? __subject__.email));
      };
  };
  ALTER TYPE default::User {
      ALTER PROPERTY name {
          DROP REWRITE
              UPDATE ;
          };
      };
  ALTER TYPE default::User {
      ALTER PROPERTY name {
          CREATE REWRITE
              UPDATE 
              USING ((__subject__.name ?? __subject__.email));
      };
  };
};
