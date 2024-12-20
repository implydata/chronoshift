/*
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

/**
 * Duck-type comptible interface for `Instance` from `immutable-class` to avoid
 * adding it as a regular dependency.
 */
export interface ImmutableClassInstance<ValueType, JSType> {
  valueOf(): ValueType;
  toJS(): JSType;
  toJSON(): JSType;
  equals(other: ImmutableClassInstance<ValueType, JSType> | undefined): boolean;
}

export function isDate(d: any) {
  return !!(d && d.toISOString);
}
