class Clement {
  constructor(sayit) {
    this.sayit = sayit;
  }

  sayIt() {
    return console.log(this.sayit);
  }
}

let clement = new Clement('Hi');
clement.sayIt();
