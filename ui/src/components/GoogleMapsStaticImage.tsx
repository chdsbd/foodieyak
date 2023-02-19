import { useLayoutEffect, useRef, useState } from "react"

import { GOOGLE_MAPS_API_KEY } from "../config"

export function GoogleMapsStaticImage({
  markerLocation,
  googleMapsPlaceId,
  variant = "color",
}: {
  markerLocation: string
  googleMapsPlaceId: string
  variant?: "gray" | "color"
}) {
  // We adjust the width of the image to fit the anchor element.
  //
  // We use object-fit: cover to ensure the image looks okay even if the size is off.
  // By using the exact size, Google Maps will render a better looking image that has points of interest correctly fitted in the image.
  const ref = useRef<HTMLAnchorElement | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth)
    }
  }, [])

  const searchParams = {
    key: GOOGLE_MAPS_API_KEY,
    map_id: variant === "color" ? "a7ace313e8de6a37" : "5b431cb5aca0f386",
    markers:
      variant === "gray" ? `color:black|${markerLocation}` : markerLocation,
    zoom: "14",
    size: `${width}x100`,
    scale: "2",
    ts: "100",
  }
  const url = new URL("https://maps.googleapis.com/maps/api/staticmap")
  for (const [key, val] of Object.entries(searchParams)) {
    url.searchParams.set(key, val)
  }

  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    markerLocation,
  )}&query_place_id=${encodeURIComponent(googleMapsPlaceId)}`

  return (
    <a href={href} target="_blank" ref={ref} style={{ width: "100%" }}>
      {width > 0 && (
        <img style={{ height: "100px", objectFit: "cover" }} src={url.href} />
      )}
    </a>
  )
}
