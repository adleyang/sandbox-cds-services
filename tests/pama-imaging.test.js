/* eslint-env jest */

const app = require('../index.js');
const stub = require('./stubs/pama-imaging-stub');

// Basing content tests on
// https://github.com/argonautproject/cds-hooks-for-pama/blob/master/connectathon-scenarios-2019-09/README.md

const request = require('supertest');

describe('PAMA Imaging Service Endpoint', () => {
  async function confirm(rating, input, done) {
    const response = await request(app)
      .post('/cds-services/pama-imaging')
      .send(input)
      .type('json');

    expect(response.status).toEqual(200);
    const { systemActions } = response.body.extension;

    expect(systemActions).toHaveLength(1);
    expect(systemActions[0].type).toEqual('update');
    const ratings = systemActions[0]
      .resource
      .extension
      .filter(e => e.url === 'http://fhir.org/argonaut/Extension/pama-rating')
      .map(e => e.valueCodeableConcept.coding[0]);

    expect(ratings).toHaveLength(1);
    expect(ratings[0]).toEqual({
      system: 'http://fhir.org/argonaut/CodeSystem/pama-rating',
      code: rating,
    });

    done();
  }

  test('It returns "not-appropriate", given "spine CT for low back pain"', (done) => {
    confirm('not-appropriate', stub.s1r1, done);
  });

  test('It returns "appropriate", given "CT head for multiple reasons"', (done) => {
    confirm('appropriate', stub.s1r2, done);
  });

  test('It returns "no-guidelines-apply", given "MRI for a toothache"', (done) => {
    confirm('no-guidelines-apply', stub.s1r3, done);
  });

  test('It returns "appropriate", given "Abdominal MRI for pancreatitis with kidney disease"', (done) => {
    done();
  });

  test('It returns no rating, given "CT angiogram of chest for Dyspnea"', (done) => {
    done();
  });
});
