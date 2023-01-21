import { z } from "zod"
// import zodToJsonSchema from "zod-to-json-schema";
import { createTypeAlias, printNode, zodToTs } from "zod-to-ts"

import {
  FriendSchema,
  PlaceCheckInSchema,
  PlaceMenuItemSchema,
  PlaceSchema,
  UserSchema,
} from "../api-schemas"

const mySchema = z.object({
  UserSchema,
  PlaceSchema,
  PlaceMenuItemSchema,
  PlaceCheckInSchema,
  FriendSchema,
})

// TODO: write these to files

// zodToJsonSchema(mySchema, "Schema");
const { node } = zodToTs(mySchema, "FullSchema")
// console.log(JSON.stringify(jsonSchema, null, 2));
// eslint-disable-next-line no-console
console.log(printNode(createTypeAlias(node, "Schema")))
