CREATE MIGRATION m1ub7xtvi2kcb2oohkdmh2zh554cmroboqkambsoshsqh6z3yvtapq
    ONTO m1dscpg4imimmgerwjs4bqzcqlnjroqmk2rvtmlehubogu25kd765q
{
  CREATE ABSTRACT TYPE default::Base {
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (SELECT
              std::datetime_of_statement()
          );
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY updated: std::datetime {
          SET default := (SELECT
              std::datetime_of_statement()
          );
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE TYPE default::User EXTENDING default::Base {
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive ON (std::str_lower(__subject__));
          CREATE CONSTRAINT std::expression ON ((__subject__ = std::str_trim(__subject__)));
          CREATE REWRITE
              INSERT 
              USING (std::str_trim(.email));
          CREATE REWRITE
              UPDATE 
              USING (std::str_trim(.email));
      };
      CREATE PROPERTY name: std::str {
          CREATE REWRITE
              INSERT 
              USING ((__subject__.name ?= __subject__.email));
          CREATE REWRITE
              UPDATE 
              USING ((__subject__.name ?= __subject__.email));
      };
      CREATE REQUIRED PROPERTY password_hash: std::str;
  };
};
