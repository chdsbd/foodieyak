import { startCase } from "./textutils"

test.each([
  ["über corn", "Über Corn"],
  ["Braised 1/2 chicken", "Braised 1/2 Chicken"],
  ["all lower case words", "All Lower Case Words"],
])("startCase", (input: string, expected: string) => {
  expect(startCase(input)).toEqual(expected)
})
