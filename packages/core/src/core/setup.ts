import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat.js';

export function coreSetup() {
	dayjs.extend(CustomParseFormat);
}
