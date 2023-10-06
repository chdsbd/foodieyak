CREATE MIGRATION m1kcoicof67vtrvens4s6pjdqz3pglehf2q5ekj75zcwo7gl7w5wpa
    ONTO m1waallie5cwef6uufjmtst2nusrltyt5hmb2p4o7qiq452idd2vba
{
  CREATE TYPE default::Team EXTENDING default::Base {
      CREATE REQUIRED MULTI LINK members: default::User;
      CREATE PROPERTY name: std::str;
  };
};
