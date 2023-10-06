CREATE MIGRATION m13k57atoq3vtrpy3lq4xce2ezumak2obmfddjlfynnnptoltgx67a
    ONTO m1gdtel3diwofaehadyt6uyvfmpf55egzrqpw44b6zih2f2apz3djq
{
  ALTER TYPE foodieyak::UserLogin {
      CREATE REQUIRED PROPERTY password: std::str {
          SET REQUIRED USING (<std::str>{std::random()});
          CREATE CONSTRAINT std::min_len_value(8);
      };
  };
};
