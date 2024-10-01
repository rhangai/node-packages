import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat.js';
import Utc from 'dayjs/plugin/utc.js';

export function coreSetup() {
	dayjs.extend(CustomParseFormat);
	dayjs.extend(Utc);
}
