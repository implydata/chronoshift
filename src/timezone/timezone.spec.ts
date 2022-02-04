/*
 * Copyright 2014-2015 Metamarkets Group Inc.
 * Copyright 2015-2019 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Class, typeCheck } from 'immutable-class';
import { testImmutableClass } from 'immutable-class-tester';

import { Timezone } from './timezone';

typeCheck<Class<string, string>>(Timezone);

describe('Timezone', () => {
  it('is an immutable class', () => {
    testImmutableClass(Timezone, ['America/Los_Angeles', 'Europe/Paris', 'Etc/UTC']);
  });

  describe('errors', () => {
    it('throws error if invalid timezone', () => {
      expect(() => new Timezone('')).toThrow("timezone '' does not exist");

      expect(() => new Timezone('Blah/UTC')).toThrow("timezone 'Blah/UTC' does not exist");

      expect(() => new Timezone('America/Lost_Angeles')).toThrow(
        "timezone 'America/Lost_Angeles' does not exist",
      );
    });
  });

  describe('#toString', () => {
    it('gives back the correct string for LA', () => {
      const timezoneStr = 'America/Los_Angeles';
      expect(new Timezone(timezoneStr).toString()).toEqual(timezoneStr);
    });

    it('gives back the correct string for UTC', () => {
      const timezoneStr = 'Etc/UTC';
      expect(new Timezone(timezoneStr).toString()).toEqual(timezoneStr);
    });

    it('gives back the correct string for inbuilt UTC', () => {
      expect(Timezone.UTC.toString()).toEqual('Etc/UTC');
    });
  });

  describe('.formatDateWithTimezone', () => {
    it('works with no timezone', () => {
      expect(Timezone.formatDateWithTimezone(new Date('2016-12-08T19:46:13.915Z'))).toEqual(
        '2016-12-08T19:46:13.915Z',
      );

      expect(Timezone.formatDateWithTimezone(new Date('2016-12-08T19:46:13.000Z'))).toEqual(
        '2016-12-08T19:46:13Z',
      );
    });

    it('works with UTC', () => {
      const tz = Timezone.UTC;

      expect(Timezone.formatDateWithTimezone(new Date('2016-12-08T19:46:13.915Z'), tz)).toEqual(
        '2016-12-08T19:46:13.915Z',
      );

      expect(Timezone.formatDateWithTimezone(new Date('2016-12-08T19:46:13.000Z'), tz)).toEqual(
        '2016-12-08T19:46:13Z',
      );
    });

    it('works with Asia/Kathmandu', () => {
      const tz = Timezone.fromJS('Asia/Kathmandu');

      expect(Timezone.formatDateWithTimezone(new Date('2016-12-08T19:46:13.915Z'), tz)).toEqual(
        '2016-12-09T01:31:13.915+05:45',
      );

      expect(Timezone.formatDateWithTimezone(new Date('2016-12-08T19:46:13.000Z'), tz)).toEqual(
        '2016-12-09T01:31:13+05:45',
      );
    });
  });
});
