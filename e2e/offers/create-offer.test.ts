import assert from 'node:assert';
import { Headers, fetch } from 'undici';
import { describe, test } from 'vitest';
import {CityEnum} from '../../src/types/city.enum';
import {HousingType} from '../../src/types/housing-type.enum';
import {Facilities} from '../../src/types/facilities.enum';
import LoggedUserRdo from '../../src/modules/user/rdo/logged-user.rdo';
import UserRdo from '../../src/modules/user/rdo/user.rdo.js';
import {OfferRdo} from '../../src/modules/offer/rdo/offer.rdo.js';

process.env['E2E_ENDPOINT'] = 'http://localhost:4000';
assert(process.env['E2E_ENDPOINT'] !== undefined);
assert(process.env['E2E_ENDPOINT'].startsWith('http') === true, 'E2E_ENDPOINT должен начинаться с протокола');

const url = new URL(process.env['E2E_ENDPOINT']);

describe('POST /offers', async () => {
  test('Success offers create', async (tc) => {
    const offer = {
      name: 'nametenlenght',
      description: 'descriptiontwentylenght',
      city: CityEnum.Amsterdam,
      premium: true,
      housingType: HousingType.House,
      roomCount: 2,
      guestCount: 3,
      cost: 10000,
      facilities: [Facilities.AirConditioning],
      userId: '',
      coordinates: {latitude: 2.22222, longitude: 3.444444}
    };

    const user = {
      email: 'test@test.com',
      password: '12345678910',
    };

    const registerResponse = await fetch(new URL('/users/register', url), {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      body: JSON.stringify({
        type: 'simple',
        email: 'test@test.com',
        username: 'name',
        password: '12345678910',
      })
    });

    const userRdo = await registerResponse.json() as unknown as UserRdo;
    const loginResponse = await fetch(new URL('/users/login', url), {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      body: JSON.stringify(user)
    });

    const content: LoggedUserRdo = await loginResponse.json() as unknown as LoggedUserRdo;
    const response = await fetch(new URL('/offers', url), {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
        'Authorization': `Bearer ${content.token}`
      }),
      body: JSON.stringify({...offer, userId: userRdo.id})
    });

    tc.expect(response.ok).toBeTruthy();
    tc.expect(response.status).toStrictEqual(201);
    tc.expect(response.headers.get('content-type')).toMatch(/application\/json/);
    const res = await response.json() as OfferRdo;
    const author = {...res.offerAuthor, id: 0};
    tc.expect({...res, id: 0, offerAuthor: author}).toMatchSnapshot();
  });
});
