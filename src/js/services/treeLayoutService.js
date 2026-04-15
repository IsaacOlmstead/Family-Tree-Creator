export function computeTreeLayout(people) {
  return people.map((person, index) => {
    const defaultX = 40 + index * 280;
    const defaultY = 40 + Math.floor(index / 3) * 180;
    const x = person.x != null ? person.x : defaultX;
    const y = person.y != null ? person.y : defaultY;

    if (person.x == null) {
      person.x = x;
    }
    if (person.y == null) {
      person.y = y;
    }

    return {
      id: person.id,
      x,
      y,
    };
  });
}

export function routeConnection(source, target) {
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}
