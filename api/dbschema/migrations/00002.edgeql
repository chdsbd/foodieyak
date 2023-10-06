CREATE MIGRATION m1repjtdbz3gznidrrpcfmanyqrdmyj6txxtkodhn55cr25ib2bwra
    ONTO m1uwekrn4ni4qs7ul7hfar4xemm5kkxlpswolcoyqj3xdhweomwjrq
{
  ALTER TYPE default::Movie {
      ALTER PROPERTY title {
          SET REQUIRED USING (<std::str>{});
      };
  };
};
