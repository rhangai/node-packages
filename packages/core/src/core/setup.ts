import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';

export function coreSetup() {
	dayjs.extend(CustomParseFormat);
}
