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
import { Component, useMemo } from "react"
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
import * as config from "../config"
import { formatHumanDate } from "../date"
import {
  useLastVisitedOn,
  usePersonalUserInfo,
  usePlaces,
  useUser,
} from "../hooks"
import { pathPlaceCreate, pathPlaceDetail } from "../paths"
import { notUndefined } from "../type-guards"

class HackErrorBoundary extends Component<
  { children: React.ReactNode },
  {
    readonly error: null | Error
  }
> {
  state = {
    error: null,
  }
  componentDidCatch(error: Error) {
    this.setState({ error })
  }
  render() {
    if (this.state.error) {
      return null
    }
    return this.props.children
  }
}

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
              {hit != null ? <Highlight hit={hit} attribute="name" /> : name}
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
              <HackErrorBoundary>
                <LastVisitedOn placeId={placeId} userId={userId} />
              </HackErrorBoundary>
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

  const placesMap = props.places.reduce<Record<string, Place | undefined>>(
    (acc, val) => {
      acc[val.id] = val
      return acc
    },
    {},
  )

  // If we don't have any query, we can just show all places from Firestore.
  // When we have a query, we'll want to filter based on the Algolia results.
  const filteredPlaces = (
    !hasQuery
      ? props.places
      : // display the results as they are sorting from Algolia based on relevance.
        // Otherwise we'll just show places alphbetically, which isn't what we want.
        hits.map((x) => placesMap[x.objectID]).filter(notUndefined)
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
  const userPersonalInfo = usePersonalUserInfo(userId)

  const searchClient = useMemo(() => {
    if (
      userPersonalInfo === "loading" ||
      !userPersonalInfo.algoliaSearchApiKey
    ) {
      return null
    }
    return algoliasearch(
      config.ALGOLIA_APP_ID,
      userPersonalInfo.algoliaSearchApiKey,
    )
  }, [userPersonalInfo])
  if (places === "loading" || searchClient == null) {
    // Empty state for loading.
    return <Input placeholder="Search" type="search" value="" isReadOnly />
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      // use custom routing config so we can have `search` be our query parameter.
      // https://www.algolia.com/doc/guides/building-search-ui/going-further/routing-urls/react-hooks/
      routing={{
        stateMapping: {
          stateToRoute(uiState) {
            const indexUiState = uiState[config.ALGOLIA_PLACES_SEARCH_INDEX]
            return { search: indexUiState.query }
          },
          routeToState(routeState) {
            return {
              [config.ALGOLIA_PLACES_SEARCH_INDEX]: {
                query: routeState.search,
              },
            }
          },
        },
      }}
      indexName={config.ALGOLIA_PLACES_SEARCH_INDEX}
    >
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
