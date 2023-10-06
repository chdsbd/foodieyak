CREATE MIGRATION m1waallie5cwef6uufjmtst2nusrltyt5hmb2p4o7qiq452idd2vba
    ONTO m13tfjxak5q77pcpyork72acirjq3hdhjqqtq4pjzik6nnucrmuw5q
{
  ALTER TYPE default::Session {
      ALTER LINK user {
          SET TYPE default::User USING (.user[IS default::User]);
      };
  };
};
