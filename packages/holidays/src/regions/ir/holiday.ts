import type { Holiday } from '../../types.js';
import type { IranHolidayId } from './ids.js';
import { iranHolidayNames } from './names/index.js';

/** Build one Iran holiday record from an id and calendar kind. */
export function iranHoliday(id: IranHolidayId, kind: Holiday['kind']): Holiday {
  return { id, kind, names: iranHolidayNames(id) };
}
