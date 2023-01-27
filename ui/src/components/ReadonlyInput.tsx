import { Input } from "@chakra-ui/react"

export function ReadonlyInput({ value }: { value: string }) {
  return (
    <Input
      type="text"
      value={value}
      disabled
      sx={{
        _disabled: {},
        _hover: {},
        // iOS has a `opacity: 0.4` user style for disabled inputs
        opacity: 1,
      }}
    />
  )
}
