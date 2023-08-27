import { Wrapper } from "@googlemaps/react-wrapper"
import { useEffect, useRef } from "react"

import { Place } from "../api-schemas"
import { GOOGLE_MAPS_API_KEY } from "../config"
import { useRemoteConfigValue } from "../hooks"
import { GoogleMapsStaticImage } from "./GoogleMapsStaticImage"

function InternalLocationImage({
  markerLocation,
  variant = "color",
  geoInfo,
}: {
  markerLocation: string
  variant: "gray" | "color"
  geoInfo: NonNullable<Place["geoInfo"]>
}) {
  // We adjust the width of the image to fit the anchor element.
  //
  // We use object-fit: cover to ensure the image looks okay even if the size is off.
  // By using the exact size, Google Maps will render a better looking image that has points of interest correctly fitted in the image.
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }
    const latLng = { lat: geoInfo.latitude, lng: geoInfo.longitude }
    const map = new window.google.maps.Map(ref.current, {
      center: latLng,
      zoom: 14,
      mapId: variant === "gray" ? "5b431cb5aca0f386" : "a7ace313e8de6a37",
      clickableIcons: false,
      disableDefaultUI: true,
      draggableCursor: "pointer",
      gestureHandling: "none",

      keyboardShortcuts: false,
    })
    const pinViewGlyph = new google.maps.marker.PinView({
      glyphColor: "#4C4C4C",
      borderColor: "#4C4C4C",
      background: "#666666",
    })
    new window.google.maps.marker.AdvancedMarkerView({
      map,
      content: pinViewGlyph.element,
      position: latLng,
    })
  })

  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    markerLocation,
  )}&query_place_id=${encodeURIComponent(geoInfo.googlePlaceId)}`

  return (
    <a href={href} target="_blank" style={{ width: "100%", height: "100px" }}>
      <div style={{ width: "100%", height: "100px" }} ref={ref} />
    </a>
  )
}

export function GoogleMapsJSMap({
  markerLocation,
  variant = "color",
  geoInfo,
}: {
  markerLocation: string

  variant?: "gray" | "color"
  geoInfo: NonNullable<Place["geoInfo"]>
}) {
  return (
    <GoogleMapsStaticImage
      googleMapsPlaceId={geoInfo.googlePlaceId}
      markerLocation={markerLocation}
      variant={variant}
    />
  )
}
