const { faker } = require('@faker-js/faker');
const { join } = require('path');
const { writeFile } = require('fs/promises');

const Car = require('../src/entities/Car');
const CarCategory = require('../src/entities/CarCategory');
const Customer = require('../src/entities/Customer');

const seederBaseFolder = join(__dirname, '../', 'database');

const AMOUNT_PER_SEED = 2;

const MIN_PRICE = 50;
const MAX_PRICE = 150;

const MIN_AGE = 18;
const MAX_AGE = 90;

const carCategory = new CarCategory({
  id: faker.datatype.uuid(),
  name: faker.vehicle.type(),
  carIds: [],
  price: faker.finance.amount(MIN_PRICE, MAX_PRICE),
});

const cars = [];
for (let index = 0; index <= AMOUNT_PER_SEED; index += 1) {
  const car = new Car({
    id: faker.datatype.uuid(),
    name: faker.vehicle.model(),
    releaseYear: faker.date.past().getFullYear(),
    availableForRental: true,
    hasFuel: true,
  });

  carCategory.carIds.push(car.id);
  cars.push(car);
}

const customers = [];
for (let index = 0; index <= AMOUNT_PER_SEED; index += 1) {
  const customer = new Customer({
    id: faker.datatype.uuid(),
    name: faker.name.firstName(),
    birthDate: faker.date.birthdate(MIN_AGE, MAX_AGE, 'age'),
  });

  customers.push(customer);
}

const write = (filename, data) => (
  writeFile(join(seederBaseFolder, filename), JSON.stringify(data))
);

(async () => {
  await write('cars.json', cars);
  await write('carCategories.json', [carCategory]);
  await write('customers.json', customers);
})();
