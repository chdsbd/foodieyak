CREATE MIGRATION m1tl33ibtduqnp7flc3jyi3cq2nessusfwl74nub74eatotph4226a
    ONTO m1repjtdbz3gznidrrpcfmanyqrdmyj6txxtkodhn55cr25ib2bwra
{
  CREATE MODULE foodieyak IF NOT EXISTS;
  CREATE TYPE foodieyak::PlaceGeoInfo {
      CREATE REQUIRED PROPERTY googlePlaceId: std::str;
      CREATE REQUIRED PROPERTY latitude: std::float64;
      CREATE REQUIRED PROPERTY longitude: std::float64;
  };
  CREATE TYPE foodieyak::Place {
      CREATE LINK geoInfo: foodieyak::PlaceGeoInfo;
      CREATE REQUIRED PROPERTY location: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
  };
};
