import pickCharities from './pick-charities';
import fastShuffle from 'fast-shuffle'
import * as charities from './fixtures/charities.json';
import * as profile from './fixtures/profile.json';
import CharityCounts from './interfaces/charity-counts';
import Charity from './interfaces/charity';
import Profile from './interfaces/profile';

jest.mock('fast-shuffle');

// Select the correct overload for the fastShuffle function.
type FastShuffle = <T>(randomSeed: number | (() => number), deck: T[]) => T[];
const mockedShuffle = jest.mocked(fastShuffle as FastShuffle);

// Set the seed to a fixed number for consistent unit tests.
mockedShuffle.mockImplementation((_seed, deck) => {
	const fastShuffle = jest.requireActual('fast-shuffle').default as FastShuffle;
	return fastShuffle(1, deck);
});

interface ExtraCharityCounts extends CharityCounts {
	national: number;
	featured: number;
}

// A little count helper function to make the test results more concise.
function getCounts(charities: Charity[], profile: Profile): ExtraCharityCounts {
	const counts: ExtraCharityCounts = {
		'state': 0,
		'national': 0,
		'featured': 0,
		'pet': 0,
		'total': 0
	};

	for (const charity of charities) {
		if (charity.featured === 'STATE' && charity.state === profile.state) {
			counts.state++;
		}
		if (charity.featured === 'NATIONAL') {
			counts.national++;
		}
		if (charity.featured !== undefined) {
			counts.featured++;
		}
		if (charity.category === 'ANIMAL_RELATED') {
			counts.pet++;
		}
		counts.total++;
	}

	return counts;
}

describe('Pick charities', (): void => {
	test('does not exceed state count with pets', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 1,
			'pet': 2,
			'total': 7
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharityCounts = getCounts(pickedCharities, profile);

		expect(pickedCharityCounts.state).toBeLessThanOrEqual(targetCounts.state);
	});
	test('does not exceed state count with pets disabled', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 1,
			'pet': 0,
			'total': 7
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharityCounts = getCounts(pickedCharities, profile);

		expect(pickedCharityCounts.state).toBeLessThanOrEqual(targetCounts.state);
	});
	test('falls back to national pets if there are no more state pets', () => {
		expect.assertions(4);

		const targetCounts = {
			'state': 2,
			'pet': 4,
			'total': 4
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharityCounts = getCounts(pickedCharities, profile);

		expect(pickedCharityCounts.state).toEqual(targetCounts.state);
		expect(pickedCharityCounts.pet).toEqual(targetCounts.pet);
		expect(pickedCharityCounts.national).toEqual(2);
		expect(pickedCharityCounts.total).toEqual(targetCounts.total);
	});
	test('matches user\'s state', () => {
		expect.assertions(3);

		const targetCounts = {
			'state': 3,
			'pet': 0,
			'total': 3
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);

		expect(pickedCharities[0]?.state).toEqual(profile.state);
		expect(pickedCharities[1]?.state).toEqual(profile.state);
		expect(pickedCharities[2]?.state).toEqual(profile.state);
	});
	test('contains unique results', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 3,
			'pet': 4,
			'total': 9
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);

		expect(pickedCharities).toEqual([...new Set(pickedCharities)]);
	});
	test('contains random results', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 3,
			'pet': 4,
			'total': 9
		}

		const randomizedPickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharities = charities.filter(charity => randomizedPickedCharities.includes(charity));

		expect(randomizedPickedCharities).not.toEqual(pickedCharities);
	});
	test('contains only featured results', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 3,
			'pet': 0,
			'total': 9
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharityCounts = getCounts(pickedCharities, profile);

		expect(pickedCharityCounts.featured).toEqual(targetCounts.total);
	});
	test('meets pet count', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 2,
			'pet': 4,
			'total': 5
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharityCounts = getCounts(pickedCharities, profile);

		expect(pickedCharityCounts.pet).toEqual(targetCounts.pet);
	});
	test('meets pet and state counts', () => {
		expect.assertions(2);

		const targetCounts = {
			'state': 2,
			'pet': 4,
			'total': 4
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharityCounts = getCounts(pickedCharities, profile);

		expect(pickedCharityCounts.state).toEqual(targetCounts.state);
		expect(pickedCharityCounts.pet).toEqual(targetCounts.pet);
	});
	test('meets pet and state counts when there are not enough state with pet matches', () => {
		expect.assertions(2);

		const targetCounts = {
			'state': 3,
			'pet': 4,
			'total': 7
		}

		const pickedCharities = pickCharities(charities, profile, targetCounts);
		const pickedCharityCounts = getCounts(pickedCharities, profile);

		expect(pickedCharityCounts.state).toEqual(targetCounts.state);
		expect(pickedCharityCounts.pet).toEqual(targetCounts.pet);
	});
	test('fails if there are not enough pets to fill the target total', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 1,
			'pet': 4,
			'total': 4
		}

		expect(() => {
			pickCharities(charities, profile, targetCounts);
		}).toThrow(Error);
	});
	test('fails if there are not enough states to fill the target total', () => {
		expect.assertions(1);

		const targetCounts = {
			'state': 1,
			'pet': 0,
			'total': 8
		}

		expect(() => {
			pickCharities(charities, profile, targetCounts);
		}).toThrow(Error);
	});
});
