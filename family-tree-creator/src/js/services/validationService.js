export function validateDate(value) {
  if (!value) {
    return true;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function validatePerson(person) {
  return (
    typeof person.id === "string" &&
    typeof person.name === "string" &&
    person.name.trim().length > 0 &&
    validateDate(person.birth) &&
    validateDate(person.death) &&
    Array.isArray(person.parents) &&
    Array.isArray(person.children)
  );
}
