export const sampleTreeData = [
  {
    id: "p1",
    name: "Alex Morgan",
    birth: "1945-08-12",
    death: "2022-06-02",
    parents: [],
    children: ["p2", "p3"],
  },
  {
    id: "p2",
    name: "Diana Morgan",
    birth: "1970-04-03",
    parents: ["p1"],
    children: ["p4"],
  },
  {
    id: "p3",
    name: "Ethan Morgan",
    birth: "1973-11-14",
    parents: ["p1"],
    children: [],
  },
  {
    id: "p4",
    name: "Lily Carter",
    birth: "1995-02-20",
    parents: ["p2"],
    children: [],
  },
];
