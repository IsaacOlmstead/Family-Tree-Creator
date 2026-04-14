import { Person } from "../src/js/models/Person.js";

test("Person class assigns properties correctly", () => {
  const person = new Person({
    id: "p1",
    name: "Ava",
    birth: "1990-01-01",
    death: null,
    parents: [],
    children: [],
  });

  expect(person.name).toBe("Ava");
  expect(person.birth).toBe("1990-01-01");
  expect(person.age).toBeGreaterThan(0);
});
