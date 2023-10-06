CREATE MIGRATION m137ku3fzzbq6bie63y5t6chg3ro6vhcfz2eizcvqlstlhokgncgpa
    ONTO m1cim4ond3ctjlp24pw72jvwwor5bfq7rlzamexdd4ao6b6hnrqx7q
{
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY password {
          DROP CONSTRAINT std::min_len_value(8);
      };
  };
};
