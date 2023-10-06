CREATE MIGRATION m1a5gkc5th7cvbxpraff3y64k3wnagpjfks5hpfwet6ezxsmxuylha
    ONTO m1ktoe7juxe3sccyuxtskilkzveb7mn6nmmsboqqp7iqhvdrxcmy7a
{
  ALTER TYPE foodieyak::UserLogin {
      ALTER PROPERTY email {
          CREATE CONSTRAINT std::expression ON ((__subject__ = std::str_trim(__subject__)));
      };
  };
};
