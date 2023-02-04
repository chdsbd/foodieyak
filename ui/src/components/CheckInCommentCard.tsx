import { Card, CardBody, Text, VStack } from "@chakra-ui/react"

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
    <VStack alignItems="start" as={Card} width="full" size="sm">
      <VStack as={CardBody} alignItems="start" spacing={0}>
        <Text>
          <Text as="span" fontWeight={"bold"}>
            <UserIdToName userId={c.createdById} />
          </Text>
          {"   "}
          <Text as="span" fontSize="sm">
            {c.checkedInAt != null ? formatHumanDate(c.checkedInAt) : "-"}
          </Text>
        </Text>

        {c.comment && <Text>{c.comment}</Text>}
        {c.ratings.length > 0 && <Rating ratings={c.ratings} />}
      </VStack>
    </VStack>
  )
}
