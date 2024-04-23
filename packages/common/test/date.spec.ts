import { dateParse } from '../src/types/date/date-parse';
import { dateIsValue } from '../src/types/date/date-type';

describe('DateType', () => {
	it('should parse dates', () => {
		const date = dateParse('2020-12-31', { inputFormat: 'YYYY-MM-DD' });
		expect(date.year()).toBe(2020);
		expect(date.month()).toBe(11);
		expect(date.date()).toBe(31);
		expect(dateIsValue(date)).toBe(true);
	});

	it('should format dates', () => {
		const date = dateParse('2020-12-31', { inputFormat: 'YYYY-MM-DD' });
		expect(date.format('DD/MM/YYYY')).toBe('31/12/2020');
		expect(date.format('YYYY-MM-DD')).toBe('2020-12-31');
	});
});
