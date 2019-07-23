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

import { Class, Instance } from 'immutable-class';
import moment from 'moment-timezone';

/**
 * Represents timezones
 */
let check: Class<string, string>;
export class Timezone implements Instance<string, string> {
  static UTC: Timezone = new Timezone('Etc/UTC');

  private timezone: string;

  static isTimezone(candidate: any): boolean {
    return candidate instanceof Timezone;
  }

  static formatDateWithTimezone(d: Date, timezone?: Timezone) {
    let str: string;
    if (timezone && !timezone.isUTC()) {
      str = moment.tz(d, timezone.toString()).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    } else {
      str = d.toISOString();
    }
    return str.replace('.000', '');
  }

  static fromJS(spec: string): Timezone {
    return new Timezone(spec);
  }

  /**
   * Constructs a timezone form the string representation by checking that it is defined
   */
  constructor(timezone: string) {
    if (typeof timezone !== 'string') {
      throw new TypeError('timezone description must be a string');
    }
    if (timezone !== 'Etc/UTC' && !moment.tz.zone(timezone)) {
      throw new Error(`timezone '${timezone}' does not exist`);
    }
    this.timezone = timezone;
  }

  public valueOf(): string {
    return this.timezone;
  }

  public toJS(): string {
    return this.timezone;
  }

  public toJSON(): string {
    return this.timezone;
  }

  public toString(): string {
    return this.timezone;
  }

  public equals(other: Timezone): boolean {
    return Timezone.isTimezone(other) && this.timezone === other.timezone;
  }

  public isUTC(): boolean {
    return this.timezone === 'Etc/UTC';
  }

  public toUtcOffsetString() {
    const utcOffset = moment.tz(this.toString()).utcOffset();
    const hours = String(Math.abs(Math.floor(utcOffset / 60))).padStart(2, '0');
    const minutes = String(Math.abs(utcOffset % 60)).padStart(2, '0');

    return `UTC ${utcOffset >= 0 ? '+' : '-'}${hours}:${minutes}`;
  }
}
check = Timezone;
