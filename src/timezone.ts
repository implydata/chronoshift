import { WallTime, Class, Instance, isInstanceOf } from "./init";
/**
 * Represents timezones
 */
var check: Class<string, string>;
export class Timezone implements Instance<string, string> {
  static UTC: Timezone;

  private timezone: string;

  static isTimezone(candidate: any): boolean {
    return isInstanceOf(candidate, Timezone);
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
    if (timezone !== 'Etc/UTC') {
      WallTime.UTCToWallTime(new Date(0), timezone); // This will throw an error if timezone is not a real timezone
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

Timezone.UTC = new Timezone('Etc/UTC');

