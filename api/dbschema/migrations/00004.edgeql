CREATE MIGRATION m1ozqnaycmbvxvxyuzgisoqu7nuzsjq6rcxmrdxrqz7joqcfdgcmrq
    ONTO m1tl33ibtduqnp7flc3jyi3cq2nessusfwl74nub74eatotph4226a
{
  CREATE ABSTRACT TYPE foodieyak::Base {
      CREATE REQUIRED PROPERTY updated: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (SELECT
              std::datetime_of_statement()
          );
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
      };
  };
  ALTER TYPE foodieyak::Place {
      CREATE PROPERTY updated: std::datetime {
          SET REQUIRED USING (std::datetime_of_statement());
      };
      EXTENDING foodieyak::Base LAST;
  };
  ALTER TYPE foodieyak::Place {
      ALTER PROPERTY updated {
          RESET OPTIONALITY;
          DROP OWNED;
          RESET TYPE;
      };
  };
  CREATE TYPE foodieyak::User EXTENDING foodieyak::Base {
      CREATE PROPERTY displayName: std::str;
      CREATE REQUIRED PROPERTY email: std::str;
  };
  CREATE TYPE foodieyak::PlaceSkippableInfo {
      CREATE REQUIRED LINK user: foodieyak::User;
  };
};
