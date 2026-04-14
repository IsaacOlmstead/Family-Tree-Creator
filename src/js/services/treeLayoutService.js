export function computeTreeLayout(people) {
  return people.map((person, index) => ({
    id: person.id,
    x: 40 + index * 280,
    y: 40 + Math.floor(index / 3) * 180,
  }));
}

export function routeConnection(source, target) {
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}
