const delay = require('delay');

const personSchema = {
  title: 'Person',
  type: 'object',
  properties: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    age: {
      description: 'Age in years',
      type: 'integer',
      minimum: 0
    }
  },
  required: ['firstName', 'lastName']
};
describe('The instance', () => {
  test('calling instance with no parameter throws an error', () => {
    expect(() => {
      const Instance = require('./instance')({});
      const instance = Instance();
    }).toThrow();
  });
  test('calling #get on configured instance should return a new object', async () => {
    const Instance = require('./instance')({});
    const instance = Instance('test');
    const testObj = await instance.get();
    expect(testObj.typeOf).toEqual('test');
  });
  test('when passing a schema to instance calling get returns default properties', async () => {
    const Instance = require('./instance')({});
    const Person = Instance('person', personSchema);
    const newPerson = await Person.get();
    expect(newPerson.firstName).toBeDefined();
    expect(newPerson.lastName).toBeDefined();
    expect(newPerson.typeOf).toEqual('person');
  });
  test('call #get with id and returns hyrdated object', async () => {
    const expectedPerson = {
      firstName: 'Test',
      lastName: 'User',
      age: 27
    };
    const Instance = require('./instance')({
      get: async (id) => {
        await delay(10);
        return expectedPerson;
      }
    });
    const Person = Instance('person', personSchema);
    const newPerson = await Person.get(1);
    expect(newPerson.firstName).toEqual(expectedPerson.firstName);
    expect(newPerson.lastName).toEqual(expectedPerson.lastName);
    expect(newPerson.typeOf).toEqual('person');
  });
  test('call #save on existing object calls correct client method and object is clean', async () => {
    const expectedPerson = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      age: 27
    };
    let called = false;
    const Instance = require('./instance')({
      get: async (id) => {
        await delay(10);
        return expectedPerson;
      },
      post: async () => {
        await delay(10);
        throw Error('do not call me');
      },
      put: async () => {
        await delay(10);
        called = true;
        return true;
      }
    });
    const Person = Instance('person', personSchema);
    const newPerson = await Person.get(1);
    expect(newPerson.firstName).toEqual(expectedPerson.firstName);
    expect(newPerson.lastName).toEqual(expectedPerson.lastName);
    newPerson.set('lastName', 'User-Tester');
    await newPerson.save();
    expect(called).toEqual(true);
    expect(newPerson.__dirty).toEqual(false);
    expect(newPerson.typeOf).toEqual('person');
  });
  test('call #save on new object calls correct client method and object is clean', async () => {
    const expectedPerson = {
      firstName: 'Save',
      lastName: 'User',
      age: 27
    };
    let called = false;
    const Instance = require('./instance')({
      post: async () => {
        await delay(10);
        called = true;
      },
      put: async () => {
        await delay(10);
        throw Error('do not call me');
        return true;
      }
    });
    const Person = Instance('person', personSchema);
    const newPerson = await Person.get({
      firstName: 'Save',
      lastName: 'User',
      age: 27
    });
    expect(newPerson.firstName).toEqual(expectedPerson.firstName);
    expect(newPerson.lastName).toEqual(expectedPerson.lastName);
    newPerson.set('lastName', 'User-Tester');
    await newPerson.save();
    expect(called).toEqual(true);
    expect(newPerson.__dirty).toEqual(false);
    expect(newPerson.typeOf).toEqual('person');
  });
});
