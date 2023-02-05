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
import algoliasearch from "algoliasearch/lite"
import { Hit } from "instantsearch.js"
import {
  Highlight,
  InstantSearch,
  useHits,
  UseHitsProps,
  useInstantSearch,
  useSearchBox,
  UseSearchBoxProps,
} from "react-instantsearch-hooks-web"
import { Link } from "react-router-dom"

import { Place } from "../api-schemas"
import { EmptyStateText } from "../components/EmptyStateText"
import { Page } from "../components/Page"
import { formatHumanDate } from "../date"
import { useLastVisitedOn, usePlaces, useUser } from "../hooks"
import { pathPlaceCreate, pathPlaceDetail } from "../paths"

const searchClient = algoliasearch(
  "UA3MF4ZCHW",
  // TODO: replace with restricted key and regenerate this in the dashboard
  // https://www.algolia.com/account/api-keys/all?applicationId=UA3MF4ZCHW
  "062dcb40ae6a8a18245c37f0f9df2afb",
)

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

function SearchHit({
  placeId,
  name,
  location,
  userId,
  hit,
}: {
  hit?: Hit
  placeId: string
  name: string
  location: string
  userId: string
}) {
  return (
    <HStack as={Link} to={pathPlaceDetail({ placeId })} w="full">
      <Card w="full" size="sm">
        <CardBody>
          <div>
            <Text fontSize="xl" fontWeight={"bold"}>
              {hit != null ? (
                <Highlight hit={hit} attribute="name" />
              ) : (
                <div>{name}</div>
              )}
            </Text>

            <HStack>
              <Text>
                {location ? (
                  hit != null ? (
                    <Highlight hit={hit} attribute="location" />
                  ) : (
                    location
                  )
                ) : (
                  " "
                )}
              </Text>
              <Spacer />
              <LastVisitedOn placeId={placeId} userId={userId} />
            </HStack>
          </div>
        </CardBody>
      </Card>
    </HStack>
  )
}

function SearchBox(props: UseSearchBoxProps) {
  const { query, refine } = useSearchBox(props)

  return (
    <Input
      placeholder="Search"
      type="search"
      value={query}
      onChange={(e) => {
        refine(e.target.value)
      }}
    />
  )
}

function SearchHits(props: UseHitsProps & { userId: string; places: Place[] }) {
  const { hits } = useHits(props)
  const { indexUiState } = useInstantSearch()

  const hitMap = hits.reduce<Record<string, Hit | undefined>>((acc, val) => {
    acc[val.objectID] = val
    return acc
  }, {})
  const hasQuery = indexUiState.query != null

  // If we don't have any query, we can just show all places from Firestore.
  // When we have a query, we'll want to filter based on the Algolia results.
  const filteredPlaces = (
    !hasQuery ? props.places : props.places.filter((x) => hitMap[x.id] != null)
  ).map((place) => {
    return { ...place, hit: hitMap[place.id] }
  })

  return (
    <>
      <div>
        {filteredPlaces.length}{" "}
        {filteredPlaces.length === 1 ? "result" : "results"}
      </div>
      {hasQuery && filteredPlaces.length === 0 && (
        <VStack w="full" spacing={2}>
          <EmptyStateText marginBottom={0}>No matching places</EmptyStateText>
          <Link
            to={
              pathPlaceCreate({}) +
              `?default_name=${encodeURIComponent(
                indexUiState.query?.trim() ?? "",
              )}`
            }
          >
            <Button size="sm">
              Add '{indexUiState.query?.trim() ?? ""}' as new Place
            </Button>
          </Link>
        </VStack>
      )}
      {filteredPlaces.map((place) => (
        <SearchHit
          location={place.location}
          name={place.name}
          placeId={place.id}
          userId={props.userId}
          hit={place.hit}
          key={place.id}
        />
      ))}
    </>
  )
}

function PlacesList({ userId }: { userId: string }) {
  const places = usePlaces(userId)

  if (places === "loading") {
    return null
  }

  return (
    <InstantSearch searchClient={searchClient} indexName="staging_places">
      {places.length === 0 && <EmptyStateText>No Places</EmptyStateText>}
      {places.length > 0 && <SearchBox />}
      <SearchHits userId={userId} places={places} />
    </InstantSearch>
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
