import { Place } from "../api-schemas"
import { GoogleMapsStaticImage } from "./GoogleMapsStaticImage"

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
