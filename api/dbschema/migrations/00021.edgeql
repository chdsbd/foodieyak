CREATE MIGRATION m1cim4ond3ctjlp24pw72jvwwor5bfq7rlzamexdd4ao6b6hnrqx7q
    ONTO m1obxeo3x74ua4sikyfqnlntd2vpwcfvhckfo3ftvx4p36q3w2sata
{
  ALTER TYPE foodieyak::User {
      ALTER LINK logins {
          ON SOURCE DELETE DELETE TARGET;
      };
  };
};
