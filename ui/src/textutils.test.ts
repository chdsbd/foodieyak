import { startCase } from "./textutils"

test.each([
  ["über corn", "Über Corn"],
  ["Braised 1/2 chicken", "Braised 1/2 Chicken"],
  ["all lower case words", "All ower Case Words"],
])("startCase", (input: string, expected: string) => {
  const x: string = 123
  expect(startCase(input)).toEqual(expected)
})
