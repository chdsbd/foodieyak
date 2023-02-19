import { Wrapper } from "@googlemaps/react-wrapper"
import { useEffect, useRef } from "react"

import { Place } from "../api-schemas"
import { DelayedLoader } from "../components/DelayedLoader"
import { Page } from "../components/Page"
import { GOOGLE_MAPS_API_KEY } from "../config"
import { usePlaces, useUser } from "../hooks"
import { pathPlaceDetail } from "../paths"

function InternalLocationImage({ places }: { places: Place[] }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }
    const bounds = new google.maps.LatLngBounds()
    const map = new window.google.maps.Map(ref.current, {
      center: { lat: 40.7128, lng: 74.006 },
      zoom: 10,
      mapId: "a7ace313e8de6a37",
    })

    places.forEach((place) => {
      if (place.geoInfo == null) {
        return
      }
      const pinViewGlyph = new google.maps.marker.PinView({
        glyphColor: "white",
        borderColor: "#DB8A31",
        background: "#FF9E67",
        glyph: new URL(
          "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet.png",
        ),
      })
      const position = {
        lat: place.geoInfo.latitude,
        lng: place.geoInfo.longitude,
      }
      bounds.extend(position)
      const m = new window.google.maps.marker.AdvancedMarkerView({
        map,
        content: pinViewGlyph.element,
        position,
        title: place.name,
      })
      m.addListener("click", () => {
        const infowindow = new google.maps.InfoWindow({
          content: `<b>${place.name}</b><br/>
          <u><a target="_blank" href="${pathPlaceDetail({
            placeId: place.id,
          })}">open in foodieyak</a></u>`,
        })
        infowindow.open({
          anchor: m,
          map,
        })
        map.addListener("click", () => {
          infowindow.close()
        })
      })
    })
    map.fitBounds(bounds)
  }, [places])

  return (
    <div
      style={{ width: "100%", height: "calc(100vh - 48px - 8px)" }}
      ref={ref}
    />
  )
}

function LocationContainer({ userId }: { userId: string }) {
  const places = usePlaces(userId)

  if (places === "loading") {
    return null
  }

  return <InternalLocationImage places={places} />
}

export function MapListView() {
  const user = useUser()

  if (user.data == null) {
    return (
      <Page>
        <DelayedLoader />
      </Page>
    )
  }
  return (
    <Page noCenter>
      <Wrapper
        apiKey={GOOGLE_MAPS_API_KEY}
        libraries={["places", "marker"]}
        version="beta"
      >
        <LocationContainer userId={user.data.uid} />
      </Wrapper>
    </Page>
  )
}
