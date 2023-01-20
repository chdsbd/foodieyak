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
import * as query from "../fakeDb";
import * as api from "../api";
import { EmptyStateText } from "../components/EmptyStateText";

export function FriendsCreateView() {
  const toast = useToast();
  const user = useUser();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [lookupResults, setLookupResults] = useState<
    api.UserFoodieYak[] | "initial"
  >("initial");
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
          api.friendLookup({ email, userId: user.data.uid }).then((res) => {
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
                    onClick={() => {
                      if (user.data == null) {
                        return;
                      }
                      api
                        .friendInviteCreate({
                          userId: user.data.uid,
                          targetUserId: r.id,
                        })
                        .then(() => {
                          toast({
                            title: "Invite sent",
                            status: "success",
                            isClosable: true,
                          });
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
