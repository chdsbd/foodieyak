import { Card, CardBody, Text, VStack } from "@chakra-ui/react"

import { PlaceCheckIn } from "../api-schemas"
import { formatHumanDateTime } from "../date"
import { UserIdToName } from "../pages/FriendsListView.page"

function Rating(props: { ratings: PlaceCheckIn["ratings"] }) {
  const positive = props.ratings.filter((x) => x.rating > 0).length
  const negative = props.ratings.filter((x) => x.rating < 0).length
  return (
    <div>
      {positive > 0 && <>{positive}↑ </>}
      {negative > 0 && <>{negative}↓</>}
    </div>
  )
}

export function CheckInCommentCard({ checkIn: c }: { checkIn: PlaceCheckIn }) {
  return (
    <VStack alignItems="start" as={Card} width="full" size="sm">
      <VStack as={CardBody} alignItems="start">
        <Text>
          <Text as="span" fontWeight={"bold"}>
            <UserIdToName userId={c.createdById} />
          </Text>
          {"   "}
          <Text as="span" fontSize="sm">
            {formatHumanDateTime(c.createdAt)}
          </Text>
        </Text>

        {c.comment && <Text>{c.comment}</Text>}
        {c.ratings.length > 0 && <Rating ratings={c.ratings} />}
      </VStack>
    </VStack>
  )
}
