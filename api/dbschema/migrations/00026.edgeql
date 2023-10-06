CREATE MIGRATION m13tfjxak5q77pcpyork72acirjq3hdhjqqtq4pjzik6nnucrmuw5q
    ONTO m1ef5ggtgt5p5tfvplctcjlhyyd2sn3s5gotznqe5avytxldhx6a3a
{
  ALTER TYPE default::Session {
      ALTER PROPERTY key {
          SET default := (SELECT
              std::uuid_generate_v4()
          );
      };
  };
};
