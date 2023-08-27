import { Button } from "@chakra-ui/react"

const disabledStyle = { _hover: {}, _focus: {}, _active: {}, cursor: "unset" }

export function Upvote({
  count,
  showColor = true,
  onClick,
}: {
  count?: number
  showColor?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <Button
      onClick={onClick}
      colorScheme={showColor ? "green" : undefined}
      sx={onClick == null ? disabledStyle : undefined}
      size="sm"
    >
      ↑ {count}
    </Button>
  )
}

export function Downvote({
  count,
  showColor = true,
  onClick,
}: {
  count?: number
  showColor?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <Button
      onClick={onClick}
      colorScheme={showColor ? "red" : undefined}
      sx={onClick == null ? disabledStyle : undefined}
      size="sm"
    >
      ↓ {count}
    </Button>
  )
}
