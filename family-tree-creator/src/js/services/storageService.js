export function exportTree(people) {
  return JSON.stringify(people, null, 2);
}

export function importTree(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Invalid JSON format.");
  }
}
