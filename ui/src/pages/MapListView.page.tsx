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
      // NYC
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 10,
      // food businesses are hidden with this style.
      mapId: "f7a404ec743f468f",
      gestureHandling: "greedy",
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
        collisionBehavior:
          google.maps.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY,
      })
      const infowindow = new google.maps.InfoWindow({
        content: `<div style="color: rgb(71, 71, 71);"><b>${place.name}</b><br/>
        <u><a target="_blank" href="${pathPlaceDetail({
          placeId: place.id,
        })}">open in foodieyak</a></u></div>`,
      })
      m.addListener("click", () => {
        infowindow.open({
          anchor: m,
          map,
        })

        map.addListener("click", () => {
          infowindow.close()
        })
      })
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const initialLocation = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude,
          )
          map.setCenter(initialLocation)
          map.setZoom(12)
        },
        () => {
          map.fitBounds(bounds)
        },
      )
    } else {
      map.fitBounds(bounds)
    }
  }, [places])

  return (
    <div style={{ width: "100%", height: "100%", flexGrow: "1" }} ref={ref} />
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
