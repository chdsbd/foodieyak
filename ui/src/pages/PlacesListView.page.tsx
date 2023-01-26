import {
  Button,
  Card,
  CardBody,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { Link } from "react-router-dom"

import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { usePlaces, useUser } from "../hooks"

export function PlacesListView() {
  const user = useUser()
  const places = usePlaces(user.data?.uid)
  const [search, setSearch] = useState("")
  return (
    <Page
      action={
        <Link to="/place/create">
          <Button size="sm">Add Place</Button>
        </Link>
      }
    >
      {places !== "loading" && (
        <>
          {places.length === 0 && <EmptyStateText>No Places</EmptyStateText>}
          {places.length > 0 && (
            <Input
              placeholder="Search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
            />
          )}

          {places.length > 0 &&
            places.filter((x) =>
              x.name.toLowerCase().includes(search.toLowerCase().trim()),
            ).length === 0 && (
              <EmptyStateText>No matching places</EmptyStateText>
            )}

          <VStack w="full">
            {places
              .filter((x) =>
                x.name.toLowerCase().includes(search.toLowerCase().trim()),
              )
              .map((place) => (
                <React.Fragment key={place.id}>
                  <HStack as={Link} to={`/place/${place.id}`} w="full">
                    <Card w="full" size="sm">
                      <CardBody>
                        <div>
                          <Text fontSize="xl" fontWeight={"bold"}>
                            {place.name}
                          </Text>
                          <Text>{place.location}</Text>
                        </div>
                      </CardBody>
                    </Card>
                  </HStack>
                </React.Fragment>
              ))}
          </VStack>
        </>
      )}
    </Page>
  )
}
