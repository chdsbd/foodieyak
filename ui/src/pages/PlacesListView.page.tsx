import {
  Button,
  Card,
  CardBody,
  HStack,
  Input,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { Link } from "react-router-dom"

import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { formatHumanDate } from "../date"
import { useLastVisitedOn, usePlaces, useUser } from "../hooks"
import { pathPlaceCreate, pathPlaceDetail } from "../paths"

function LastVisitedOn({
  placeId,
  userId,
}: {
  placeId: string
  userId: string
}) {
  const lastVisitedAt = useLastVisitedOn(placeId, userId)

  if (lastVisitedAt === "loading" || lastVisitedAt == null) {
    return null
  }

  return <Text fontSize="sm">{formatHumanDate(lastVisitedAt)}</Text>
}

function PlacesList({ userId }: { userId: string }) {
  const places = usePlaces(userId)
  const [search, setSearch] = useState("")

  if (places === "loading") {
    return null
  }

  return (
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
          <VStack w="full" spacing={2}>
            <EmptyStateText marginBottom={0}>No matching places</EmptyStateText>
            <Link to={pathPlaceCreate({}) + `?default_name=${search.trim()}`}>
              <Button size="sm">Add '{search.trim()}' as new Place</Button>
            </Link>
          </VStack>
        )}

      <VStack w="full">
        {places
          .filter((x) =>
            x.name.toLowerCase().includes(search.toLowerCase().trim()),
          )
          .map((place) => (
            <React.Fragment key={place.id}>
              <HStack
                as={Link}
                to={pathPlaceDetail({ placeId: place.id })}
                w="full"
              >
                <Card w="full" size="sm">
                  <CardBody>
                    <div>
                      <Text fontSize="xl" fontWeight={"bold"}>
                        {place.name}
                      </Text>
                      <HStack>
                        <Text>{place.location || " "}</Text>
                        <Spacer />
                        <LastVisitedOn placeId={place.id} userId={userId} />
                      </HStack>
                    </div>
                  </CardBody>
                </Card>
              </HStack>
            </React.Fragment>
          ))}
      </VStack>
    </>
  )
}

export function PlacesListView() {
  const user = useUser()
  return (
    <Page
      action={
        <Link to={pathPlaceCreate({})}>
          <Button size="sm">Add Place</Button>
        </Link>
      }
    >
      {user.data != null && <PlacesList userId={user.data.uid} />}
    </Page>
  )
}
