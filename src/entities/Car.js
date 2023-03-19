const Base = require('./Base');

class Car extends Base {
  constructor({
    id, name, releaseYear, availableForRental, hasFuel,
  }) {
    super({ id, name });
    this.releaseYear = releaseYear;
    this.availableForRental = availableForRental;
    this.hasFuel = hasFuel;
  }
}

module.exports = Car;
