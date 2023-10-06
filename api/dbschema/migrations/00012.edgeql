CREATE MIGRATION m14vann5kfcw7etl4mdy2tetxrxnucezq7suplgs4irocjwy5veaqq
    ONTO m1z7lyle2iccynsp4rzz2jin7s2mzjlfrvsvly2s2aod5msx4k2t5a
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
              USING ((.email = std::str_trim(.email)));
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
              USING ((.email = std::str_trim(.email)));
      };
  };
};
