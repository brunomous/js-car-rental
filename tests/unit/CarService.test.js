const {
  describe, it, before, beforeEach, afterEach,
} = require('mocha');
const { join } = require('path');
const { expect } = require('chai');
const sinon = require('sinon');

const CarService = require('../../src/service/CarService');
const Transaction = require('../../src/entities/Transaction');

const validCar = require('../mocks/validCar.json');
const validCarCategory = require('../mocks/validCarCategory.json');
const validCustomer = require('../mocks/validCustomer.json');

const carsDatabase = join(__dirname, './../../database', 'cars.json');

describe('CarService Suite Tests', () => {
  let carService = {};
  let sandbox = {};

  before(() => {
    carService = new CarService({
      cars: carsDatabase,
    });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should retrieve a random position from an array', () => {
    const data = [0, 1, 2, 3, 4, 5];
    const result = carService.getRandomPositionFromArray(data);

    expect(result).to.be.lte(data.length).and.be.gte(0);
  });

  it('should choose the first id from car ids in car category', () => {
    const carCategory = validCarCategory;
    const carIdIndex = 0;

    sandbox.stub(
      carService,
      carService.getRandomPositionFromArray.name,
    ).returns(carIdIndex);

    const result = carService.chooseRandomCar(carCategory);
    const expected = carCategory.carIds[carIdIndex];

    expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok;
    expect(result).to.be.equal(expected);
  });

  it('given a car category, a random available car should be returned', async () => {
    const car = validCar;
    const carCategory = Object.create(validCarCategory);
    carCategory.carIds = [car.id];

    sandbox.stub(
      carService.carRepository,
      carService.carRepository.find.name,
    ).resolves(car);

    sandbox.spy(
      carService,
      carService.chooseRandomCar.name,
    );

    const result = await carService.getAvailableCar(carCategory);
    const expected = car;

    expect(carService.chooseRandomCar.calledOnce).to.be.ok;
    expect(carService.carRepository.find.calledWithExactly(car.id));
    expect(result).to.be.deep.equal(expected);
  });

  it('given a car category, customer and number of days, calculate final amount', async () => {
    const customer = Object.create(validCustomer);

    const carCategory = Object.create(validCarCategory);
    carCategory.price = 37.6;

    const numberOfDays = 5;

    sandbox.stub(
      carService,
      'taxesByAge',
    ).get(() => [{ from: 30, to: 40, then: 1.3 }]);

    const expected = carService.currencyFormat.format(244.40);
    const result = await carService.calculateFinalPrice(customer, carCategory, numberOfDays);

    expect(result).to.be.deep.equal(expected);
  });

  it('given a customer and a car category, return a transaction receipt', async () => {
    const car = validCar;
    const carCategory = {
      ...validCarCategory,
      price: 37.6,
      carIds: [car.id],
    };
    const customer = Object.create(validCustomer);

    const numberOfDays = 5;

    const dueDate = '10 de novembro de 2020';

    const now = new Date(2020, 10, 5);

    sandbox.useFakeTimers(now.getTime());

    sandbox.stub(
      carService.carRepository,
      carService.carRepository.find.name,
    ).resolves(car);

    const expectedAmount = carService.currencyFormat.format(244.40);

    const result = await carService.rentCar(customer, carCategory, numberOfDays);

    const expected = new Transaction({
      customer,
      car,
      amount: expectedAmount,
      dueDate,
    });

    expect(result).to.be.deep.equal(expected);
  });
});
