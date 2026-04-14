export const personSchema = {
  type: "object",
  required: ["id", "name", "birth", "parents", "children"],
  properties: {
    id: { type: "string" },
    name: { type: "string", minLength: 1 },
    birth: { type: "string", format: "date" },
    death: { type: ["string", "null"], format: "date" },
    parents: { type: "array", items: { type: "string" } },
    children: { type: "array", items: { type: "string" } },
  },
};

export const treeSchema = {
  type: "array",
  items: personSchema,
};
