CREATE MIGRATION m1ktoe7juxe3sccyuxtskilkzveb7mn6nmmsboqqp7iqhvdrxcmy7a
    ONTO m14vann5kfcw7etl4mdy2tetxrxnucezq7suplgs4irocjwy5veaqq
{
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY email {
          DROP REWRITE
              INSERT ;
          };
      };
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY email {
          CREATE REWRITE
              INSERT 
              USING (std::str_trim(.email));
      };
  };
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY email {
          DROP REWRITE
              UPDATE ;
          };
      };
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY email {
          CREATE REWRITE
              UPDATE 
              USING (std::str_trim(.email));
      };
  };
};
