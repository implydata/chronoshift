/*
 * Copyright 2014-2015 Metamarkets Group Inc.
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as moment from 'moment-timezone';
import { Class, Instance } from 'immutable-class';

/**
 * Represents timezones
 */
var check: Class<string, string>;
export class Timezone implements Instance<string, string> {
  static UTC: Timezone = new Timezone('Etc/UTC');

  private timezone: string;

  static isTimezone(candidate: any): boolean {
    return candidate instanceof Timezone;
  }

  static fromJS(spec: string): Timezone {
    return new Timezone(spec);
  }

  /**
   * Constructs a timezone form the string representation by checking that it is defined
   */
  constructor(timezone: string) {
    if (typeof timezone !== 'string') {
      throw new TypeError("timezone description must be a string");
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
    return Timezone.isTimezone(other) &&
      this.timezone === other.timezone;
  }

  public isUTC(): boolean {
    return this.timezone === 'Etc/UTC';
  }
}
check = Timezone;


