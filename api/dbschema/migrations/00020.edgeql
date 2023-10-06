CREATE MIGRATION m1obxeo3x74ua4sikyfqnlntd2vpwcfvhckfo3ftvx4p36q3w2sata
    ONTO m1cer3yxqpin7lyw2eqvtbf6dxyni3lnhfmxuquurkronkqhuc7loa
{
  CREATE TYPE default::Session {
      CREATE REQUIRED LINK user: foodieyak::User;
      CREATE REQUIRED PROPERTY key: std::uuid;
  };
  ALTER TYPE foodieyak::Team {
      ALTER LINK members {
          SET REQUIRED USING (<foodieyak::User>{});
      };
  };
  ALTER TYPE foodieyak::Place {
      ALTER ACCESS POLICY team_member_has_access SET errmessage := 'Users must be a team member to view place.';
  };
  CREATE TYPE foodieyak::TeamInvite EXTENDING foodieyak::Base {
      CREATE REQUIRED LINK recipient: foodieyak::User;
      CREATE REQUIRED LINK sender: foodieyak::User;
      CREATE ACCESS POLICY sender_recipient_can_read
          ALLOW SELECT USING (((GLOBAL foodieyak::current_user ?= .sender.id) OR (GLOBAL foodieyak::current_user ?= .recipient.id)));
      CREATE REQUIRED LINK team: foodieyak::Team;
      CREATE ACCESS POLICY team_member_can_invite
          ALLOW UPDATE, DELETE, INSERT USING (((GLOBAL foodieyak::current_user IN .team.members.id) ?? false));
  };
};
