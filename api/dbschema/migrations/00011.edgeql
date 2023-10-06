CREATE MIGRATION m1z7lyle2iccynsp4rzz2jin7s2mzjlfrvsvly2s2aod5msx4k2t5a
    ONTO m13k57atoq3vtrpy3lq4xce2ezumak2obmfddjlfynnnptoltgx67a
{
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY email {
          DROP CONSTRAINT std::expression ON ((__subject__ = std::str_trim(__subject__)));
          CREATE REWRITE
              INSERT 
              USING ((__subject__.email = std::str_trim(__subject__.email)));
          CREATE REWRITE
              UPDATE 
              USING ((__subject__.email = std::str_trim(__subject__.email)));
      };
  };
};
