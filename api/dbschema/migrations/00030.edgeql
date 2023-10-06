CREATE MIGRATION m1uvy3he3z3pnj6hmdygc4kaakuoypvitjjpwb7uwgepb7ny4nwola
    ONTO m1vjhv6czwcc6aw3jdgww5laletxlckrxj6ekgepfyffujkstosmpq
{
  ALTER TYPE default::Team {
      ALTER PROPERTY name {
          CREATE REWRITE
              INSERT 
              USING (std::str_trim(.name));
          CREATE REWRITE
              UPDATE 
              USING (std::str_trim(.name));
      };
  };
};
