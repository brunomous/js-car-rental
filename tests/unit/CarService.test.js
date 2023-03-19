const {
  describe, it, before, beforeEach, afterEach,
} = require('mocha');
const { join } = require('path');
const { expect } = require('chai');
const sinon = require('sinon');

const CarService = require('../../src/service/CarService');

const validCar = require('../mocks/validCar.json');
const validCarCategory = require('../mocks/validCarCategory.json');

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
});
