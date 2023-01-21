import {
  VStack,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  Heading,
  Card,
  CardBody,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Page } from "../components/Page";
import { useUser } from "../hooks";
import * as api from "../api";
import { EmptyStateText } from "../components/EmptyStateText";
import { DelayedLoader } from "../components/DelayedLoader";
import { User } from "../api-schemas";

export function FriendsCreateView() {
  const toast = useToast();
  const user = useUser();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [lookupResults, setLookupResults] = useState<User[] | "initial">(
    "initial"
  );
  const [invitingId, setInvitingId] = useState<string | null>(null);
  if (user.data == null) {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    );
  }
  return (
    <Page>
      <Breadcrumb alignSelf={"start"}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/friends">
            Friends
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="/friends/add">
            Add
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <VStack
        width="100%"
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          api.friendLookup({ email }).then((res) => {
            setLookupResults(res);
          });
        }}
      >
        <FormControl>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <FormHelperText>Search for a user by email.</FormHelperText>
        </FormControl>
        <HStack width="100%" justify={"end"}>
          <Button type="submit">Lookup Friend</Button>
        </HStack>
        {lookupResults !== "initial" && (
          <>
            <Heading size="md" alignSelf={"start"}>
              Lookup Results
            </Heading>
            {lookupResults.map((r) => (
              <Card w="100%">
                <HStack as={CardBody}>
                  <VStack alignItems={"start"}>
                    <p>{r.displayName}</p>
                    <p>{r.email}</p>
                  </VStack>
                  <Spacer />
                  <Button
                    loadingText="Inviting..."
                    isLoading={r.uid === invitingId}
                    onClick={() => {
                      if (user.data == null) {
                        return;
                      }
                      setInvitingId(r.uid);
                      api
                        .friendInviteCreate({
                          userId: user.data.uid,
                          targetUserId: r.uid,
                        })
                        .then(() => {
                          toast({
                            title: "Invite sent",
                            status: "success",
                            isClosable: true,
                          });
                          setInvitingId(null);
                          history.push("/friends");
                        })
                        .catch((error) => {
                          const errorCode = error.code;
                          const errorMessage = error.message;
                          toast({
                            title: "Problem creating account",
                            description: `${errorCode}: ${errorMessage}`,
                            status: "error",
                            isClosable: true,
                          });
                          setInvitingId(null);
                        });
                    }}
                  >
                    Invite
                  </Button>
                </HStack>
              </Card>
            ))}
            {lookupResults.length === 0 && (
              <EmptyStateText>No Results</EmptyStateText>
            )}
          </>
        )}
      </VStack>
    </Page>
  );
}
