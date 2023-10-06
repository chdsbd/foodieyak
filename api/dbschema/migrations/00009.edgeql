CREATE MIGRATION m1gdtel3diwofaehadyt6uyvfmpf55egzrqpw44b6zih2f2apz3djq
    ONTO m1m4ophtdtsnwqbuunvt4ybnr2xwy3ebfcu22djswy374wodzaksvq
{
  ALTER TYPE foodieyak::User {
      CREATE REQUIRED MULTI LINK logins: foodieyak::UserLogin {
          SET REQUIRED USING (INSERT
              foodieyak::UserLogin
              {
                  email := ('some-email@example.com' ++ <std::str>std::random())
              });
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
