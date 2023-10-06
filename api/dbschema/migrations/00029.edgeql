CREATE MIGRATION m1vjhv6czwcc6aw3jdgww5laletxlckrxj6ekgepfyffujkstosmpq
    ONTO m1kcoicof67vtrvens4s6pjdqz3pglehf2q5ekj75zcwo7gl7w5wpa
{
  ALTER TYPE default::Team {
      ALTER PROPERTY name {
          SET REQUIRED USING (<std::str>{});
      };
  };
};
