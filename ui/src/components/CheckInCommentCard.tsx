import { Divider, HStack, Text, VStack } from "@chakra-ui/react"

import { PlaceCheckIn } from "../api-schemas"
import { formatHumanDate } from "../date"
import { UserIdToName } from "../pages/FriendsListView.page"

function Rating(props: { ratings: PlaceCheckIn["ratings"] }) {
  const positive = props.ratings.filter((x) => x.rating > 0).length
  const negative = props.ratings.filter((x) => x.rating < 0).length
  return (
    <Text as={"div"} fontSize="sm">
      {positive > 0 && <>{positive}↑ </>}
      {negative > 0 && <>{negative}↓</>}
    </Text>
  )
}

export function CheckInCommentCard({ checkIn: c }: { checkIn: PlaceCheckIn }) {
  return (
    <VStack alignItems="start" width="full">
      <VStack alignItems="start" spacing={0} w="full">
        <HStack w="full">
          <HStack marginRight="auto">
            <Text as="span" fontWeight={"bold"}>
              <UserIdToName userId={c.createdById} />
            </Text>
            {c.ratings.length > 0 && <Rating ratings={c.ratings} />}
          </HStack>
          {c.checkedInAt != null && (
            <Text as="span" fontSize="sm" marginLeft="auto">
              {formatHumanDate(c.checkedInAt)}
            </Text>
          )}
        </HStack>

        {c.comment && <Text whiteSpace={"pre-wrap"}>{c.comment}</Text>}
      </VStack>
      <Divider />
    </VStack>
  )
}
