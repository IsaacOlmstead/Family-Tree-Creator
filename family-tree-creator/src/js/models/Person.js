export class Person {
  constructor({ id, name, birth, death = null, parents = [], children = [] }) {
    this.id = id;
    this.name = name;
    this.birth = birth;
    this.death = death;
    this.parents = parents;
    this.children = children;
  }

  get age() {
    const birthYear = new Date(this.birth).getFullYear();
    const deathYear = this.death ? new Date(this.death).getFullYear() : new Date().getFullYear();
    return deathYear - birthYear;
  }
}
