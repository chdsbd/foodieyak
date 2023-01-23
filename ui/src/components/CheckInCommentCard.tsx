import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Text,
} from "@chakra-ui/react"

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
    <Card w="100%" size="sm">
      <CardHeader paddingBottom="0">
        <HStack w="100%" alignItems={"start"}>
          <Text fontWeight={"bold"}>
            <UserIdToName userId={c.createdById} />
          </Text>
          <Text color={"rgb(108, 117, 125)"}>
            {formatHumanDateTime(c.createdAt)}
          </Text>
        </HStack>
      </CardHeader>
      {c.comment && (
        <CardBody>
          <Text>{c.comment}</Text>
        </CardBody>
      )}
      {c.ratings.length > 0 && (
        <CardFooter color="rgb(108, 117, 125)">
          <Rating ratings={c.ratings} />
        </CardFooter>
      )}
    </Card>
  )
}
