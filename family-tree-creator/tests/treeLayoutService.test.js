import { computeTreeLayout, routeConnection } from "../src/js/services/treeLayoutService.js";

test("computeTreeLayout returns a layout array", () => {
  const layout = computeTreeLayout([{ id: "p1" }, { id: "p2" }]);
  expect(layout).toHaveLength(2);
  expect(layout[0]).toHaveProperty("x");
  expect(layout[0]).toHaveProperty("y");
});

test("routeConnection returns a valid svg path string", () => {
  const path = routeConnection({ x: 10, y: 10 }, { x: 20, y: 30 });
  expect(path).toContain("M 10 10");
  expect(path).toContain("L 20 30");
});
