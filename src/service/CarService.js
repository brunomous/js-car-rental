const BaseRepository = require('../repository/base/baseRepository');

const Tax = require('../entities/Tax');
const Transaction = require('../entities/Transaction');

class CarService {
  constructor({ cars }) {
    this.carRepository = new BaseRepository({ file: cars });
    this.taxesByAge = Tax.getTaxesByAge;
    this.currencyFormat = new Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  test() {
    return this.carRepository.find();
  }

  getRandomPositionFromArray(list) {
    const listLength = list.length;

    return Math.floor(Math.random() * listLength);
  }

  chooseRandomCar(carCategory) {
    const randomCarIndex = this.getRandomPositionFromArray(carCategory.carIds);
    const carId = carCategory.carIds[randomCarIndex];

    return carId;
  }

  async getAvailableCar(carCategory) {
    const carId = this.chooseRandomCar(carCategory);
    const car = await this.carRepository.find(carId);

    return car;
  }

  calculateAge(birthDate) {
    const ageDifMs = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  async calculateFinalPrice(customer, carCategory, numberOfDays) {
    const { birthDate } = customer;
    const age = this.calculateAge(birthDate);

    const { price } = carCategory;
    const { then: tax } = this.taxesByAge.find(
      (taxRange) => age >= taxRange.from && age <= taxRange.to,
    );

    const finalPrice = ((tax * price) * numberOfDays);
    const formattedFinalPrice = this.currencyFormat.format(finalPrice);

    return formattedFinalPrice;
  }

  async rentCar(customer, carCategory, numberOfDays) {
    const car = await this.getAvailableCar(carCategory);
    const finalPrice = await this.calculateFinalPrice(customer, carCategory, numberOfDays);

    const today = new Date();
    today.setDate(today.getDate() + numberOfDays);

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const dueDate = today.toLocaleDateString('pt-br', options);

    const transaction = new Transaction({
      customer,
      car,
      amount: finalPrice,
      dueDate,
    });

    return transaction;
  }
}

module.exports = CarService;
