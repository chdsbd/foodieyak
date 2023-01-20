import {
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  HStack,
  Spacer,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyStateText } from "../components/EmptyStateText";
import { Page } from "../components/Page";
import { formatHumanDateTime } from "../date";
import { useFriends, useUser } from "../hooks";
import * as api from "../api";

function UserIdToName({ userId }: { userId: string }) {
  const [name, setName] = useState<{ name: string } | "loading">("loading");
  useEffect(() => {
    console.log("here");
    api.userById({ userId }).then((res) => {
      setName({ name: res.email });
    });
  }, [userId]);
  console.log(name);
  if (name == "loading") {
    return null;
  }
  return <>{name.name}</>;
}

export function FriendsListView() {
  const toast = useToast();
  const user = useUser();
  const friends = useFriends(user.data?.uid ?? "");
  const invites = friends.filter((f) => !f.accepted);
  const acceptedFriends = friends.filter((f) => f.accepted);
  if (user.data == null) {
    return null;
  }
  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/friends">
            Friends
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {invites.length > 0 && (
        <>
          <Heading as="h2" size="md" alignSelf={"start"}>
            Invites
          </Heading>

          {invites.map((i) => (
            <HStack width={"100%"}>
              <VStack spacing={0} align={"start"}>
                <div>
                  <UserIdToName userId={i.id} />
                </div>
                {/* <div>{formatHumanDateTime(new Date(i.createdAt))}</div> */}
              </VStack>
              <Spacer />

              <Button
                size="sm"
                // colorScheme={"red"}
                variant="outline"
                onClick={() => {
                  if (!confirm("Remove invite?")) {
                    return;
                  }
                  api
                    .friendInviteCancel({
                      userId: user.data.uid,
                      targetUserId: i.id,
                    })
                    .then((res) => {
                      toast({
                        title: "Invite canceled",
                        status: "success",
                        isClosable: true,
                      });
                    })
                    .catch((error) => {
                      const errorCode = error.code;
                      const errorMessage = error.message;
                      toast({
                        title: "Problem canceling invite",
                        description: `${errorCode}: ${errorMessage}`,
                        status: "error",
                        isClosable: true,
                      });
                    });
                }}
              >
                Cancel
              </Button>
              {i.createdById != user.data.uid && (
                <Button
                  size="sm"
                  // colorScheme={"green"}
                  onClick={() => {
                    api
                      .friendInviteAccept({
                        userId: user.data.uid,
                        targetUserId: i.id,
                      })
                      .then((res) => {
                        toast({
                          title: "Invite accepted",
                          status: "success",
                          isClosable: true,
                        });
                      })
                      .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        toast({
                          title: "Problem accepting invite",
                          description: `${errorCode}: ${errorMessage}`,
                          status: "error",
                          isClosable: true,
                        });
                      });
                  }}
                >
                  Accept
                </Button>
              )}
            </HStack>
          ))}
        </>
      )}

      <HStack w="100%" alignItems={"center"}>
        <Heading as="h2" size="md">
          Friends
        </Heading>
        <Spacer />
        <Link to="/friends/add">
          <Button>Invite Friend</Button>
        </Link>
      </HStack>
      {acceptedFriends.length > 0 && <Input placeholder="Search" />}

      {acceptedFriends.length === 0 && (
        <EmptyStateText>No Friends</EmptyStateText>
      )}
      {acceptedFriends.map((f) => (
        <HStack width="100%">
          <div>
            <UserIdToName userId={f.id} />
          </div>
          <Spacer />
          <Button
            size={"sm"}
            onClick={() => {
              if (!confirm("Remove friend?")) {
                return;
              }
              api
                .friendInviteCancel({
                  userId: user.data.uid,
                  targetUserId: f.id,
                })
                .then((res) => {
                  toast({
                    title: "Friend removed",
                    status: "success",
                    isClosable: true,
                  });
                })
                .catch((error) => {
                  const errorCode = error.code;
                  const errorMessage = error.message;
                  toast({
                    title: "Problem removing friend",
                    description: `${errorCode}: ${errorMessage}`,
                    status: "error",
                    isClosable: true,
                  });
                });
            }}
          >
            remove
          </Button>
        </HStack>
      ))}
    </Page>
  );
}
