CREATE MIGRATION m1m4ophtdtsnwqbuunvt4ybnr2xwy3ebfcu22djswy374wodzaksvq
    ONTO m1llxbvouiewxcojlxetg7qgcqhqtkxfqudps4rypzjok5qpxcmbka
{
  ALTER TYPE foodieyak::User {
      DROP PROPERTY email;
  };
  CREATE TYPE foodieyak::UserLogin EXTENDING foodieyak::Base {
      CREATE LINK user: foodieyak::User;
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive ON (std::str_lower(__subject__));
          CREATE CONSTRAINT std::expression ON ((__subject__ = std::str_trim(__subject__)));
      };
  };
};
