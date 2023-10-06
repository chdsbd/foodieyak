CREATE MIGRATION m1dscpg4imimmgerwjs4bqzcqlnjroqmk2rvtmlehubogu25kd765q
    ONTO m137ku3fzzbq6bie63y5t6chg3ro6vhcfz2eizcvqlstlhokgncgpa
{
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY password {
          RENAME TO password_hash;
      };
  };
};
