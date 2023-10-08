# TODO: Add authz. I think we need tests for this to work.

module default {
  abstract type Base {
    required created: datetime {
      default := (select datetime_of_statement());
      rewrite insert using (datetime_of_statement())
    }
    required updated: datetime {
      default := (select datetime_of_statement());
      rewrite insert, update using (datetime_of_statement());
    }
  }

  type Session {
    required key: uuid {
      default := (select uuid_generate_v4());
    }
    required user: User;
  }

  type User extending Base {
    # default name to email address
    name: str {
      rewrite insert, update using (__subject__.name ?? __subject__.email)
    }

    required email: str {
        # trim whitespace on modify.
        rewrite insert, update using (
          str_trim(.email)
        );
        # no surrounding whitespace should exist.
        constraint expression on (
          __subject__ = str_trim(__subject__)
        );
        # unique case-insensitively.
        constraint exclusive on (str_lower(__subject__));
    }
    required password_hash: str;
  }

  type Team extending Base {
    required name: str {
      # trim whitespace on modify.
      rewrite insert, update using (
        str_trim(.name)
      );
    }
    # users can be members of multiple teams. Teams should have at least one user.
    required multi members: User;
  }
  type TeamInvite extending Base {
    required sender: User;
    required recipient: User;
    required team: Team;
    # access policy sender_recipient_can_read
    #   allow select
    #   using (global current_user ?= .sender.id or global current_user ?= .recipient.id);
    # access policy team_member_can_invite
    #   allow insert, update, delete
    #   using ((global current_user in .team.members.id) ?? false);
  }
}

module foodieyak {
  global current_user: uuid;
  abstract type Base {
    required created: datetime {
      default := (select datetime_of_statement());
      rewrite insert using (datetime_of_statement())
    }
    required updated: datetime {
      default := (select datetime_of_statement());
      rewrite insert, update using (datetime_of_statement());
  }
  }



  type UserLogin extending Base {
    required email: str {
        # trim whitespace on modify.
        rewrite insert, update using (
          str_trim(.email)
        );
        # no surrounding whitespace should exist.
        constraint expression on (
          __subject__ = str_trim(__subject__)
        );
        # unique case-insensitively.
        constraint exclusive on (str_lower(__subject__));
    }
    required password_hash: str;
  }

  type User extending Base {
    name: str;
    # users must have at least one login. A login can only point to a single user.
    required multi logins: UserLogin  {
        on source delete delete target;
        constraint exclusive;
    }
  }

  type TeamInvite extending Base {
    required sender: User;
    required recipient: User;
    required team: Team;
    access policy sender_recipient_can_read
      allow select
      using (global current_user ?= .sender.id or global current_user ?= .recipient.id);
    access policy team_member_can_invite
      allow insert, update, delete
      using ((global current_user in .team.members.id) ?? false);
  }

  type Team extending Base {
    name: str;
    # users can be members of multiple teams. Teams should have at least one user.
    required multi members: User;
    # places can only exist on one team.
    multi places: Place {
      constraint exclusive;
    }


  }

  # Place
  type PlaceGeoInfo {
    required latitude: float64;
    required longitude: float64;
    required googlePlaceId: str;
  }
  type PlaceSkippableInfo {
    required user: User;

  }
  type Place extending Base {
    required name: str;
    required location: str;
    geoInfo: PlaceGeoInfo;

    access policy team_member_has_access
      allow all
      using ((global current_user in .<places[is Team].members.id) ?? false)  {
      errmessage := 'Users must be a team member to view place.'
    };
  }
}
