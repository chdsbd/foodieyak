CREATE MIGRATION m1y6acbmru2tjqi3wg23fdrihrzauuedqoengmxce3g36nxfk63oma
    ONTO m1a5gkc5th7cvbxpraff3y64k3wnagpjfks5hpfwet6ezxsmxuylha
{
  ALTER TYPE foodieyak::UserLogin {
      DROP LINK user;
  };
};
