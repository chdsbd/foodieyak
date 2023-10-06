CREATE MIGRATION m1llxbvouiewxcojlxetg7qgcqhqtkxfqudps4rypzjok5qpxcmbka
    ONTO m1g5gvco6gxb7ppjrfedy2fbyeuczrkohukdkupx3qelbofaowrl4a
{
  ALTER TYPE foodieyak::Base {
      ALTER PROPERTY updated {
          SET default := (SELECT
              std::datetime_of_statement()
          );
      };
  };
};
