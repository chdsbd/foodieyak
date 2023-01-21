import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { zodToTs, createTypeAlias, printNode } from "zod-to-ts";

import {
  FriendSchema,
  PlaceCheckInSchema,
  PlaceMenuItemSchema,
  PlaceSchema,
  UserSchema,
} from "../api-schemas";

const mySchema = z.object({
  UserSchema,
  PlaceSchema,
  PlaceMenuItemSchema,
  PlaceCheckInSchema,
  FriendSchema,
});

const jsonSchema = zodToJsonSchema(mySchema, "Schema");
const { node } = zodToTs(mySchema, "FullSchema");
// console.log(JSON.stringify(jsonSchema, null, 2));
console.log(printNode(createTypeAlias(node, "Schema")));
