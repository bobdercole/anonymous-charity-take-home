import Charity from './interfaces/charity';
import Profile from './interfaces/profile';
import CharityCounts from './interfaces/charity-counts';
import fastShuffle from 'fast-shuffle'

enum PrioritySearchMode {
	None = 0,
	Pet = 1 << 0
}

enum FeaturedSearchMode {
	None = 0,
	State = 1 << 0,
	National = 1 << 1
}

interface CharityBuckets extends Record<string, Set<Charity>> {
	'pet': Set<Charity>
	'all': Set<Charity>
}

interface CharityFeaturedBuckets extends Record<string, CharityBuckets> {
	'state': CharityBuckets;
	'national': CharityBuckets
}

type SearchCondition = (charity: Charity, profile: Profile) => boolean;

type SearchConditions = {
	'pet': SearchCondition;
	'state': SearchCondition;
	'national': SearchCondition;
}

const searchConditions: SearchConditions = {
	'pet': charity => {
		return charity.category === 'ANIMAL_RELATED';
	},
	'state': (charity, profile) => {
		return charity.featured === 'STATE' && charity.state === profile.state;
	},
	'national': charity => {
		return charity.featured === 'NATIONAL';
	}
}

function determinePrioritySearchMode(currentCounts: CharityCounts, targetCounts: CharityCounts): PrioritySearchMode {
	let mode = PrioritySearchMode.None;

	if (currentCounts.pet < targetCounts.pet) {
		mode |= PrioritySearchMode.Pet;
	}

	return mode;
}

function determineFeaturedSearchMode(currentCounts: CharityCounts, targetCounts: CharityCounts, prioritySearchMode: PrioritySearchMode): FeaturedSearchMode {
	let mode = FeaturedSearchMode.None;
	const remainingStateCharities = targetCounts.state - currentCounts.state;

	if (remainingStateCharities > 0) {
		mode |= FeaturedSearchMode.State;
	}

	// Include national charities if priority mode is active in order to fulfill priority requirements.
	if (remainingStateCharities === 0 || prioritySearchMode !== PrioritySearchMode.None) {
		mode |= FeaturedSearchMode.National;
	}

	return mode;
}

function createBuckets(charities: Charity[], profile: Profile): CharityFeaturedBuckets {
	const buckets: CharityFeaturedBuckets = {
		'state': {
			'pet': new Set(),
			'all': new Set()
		},
		'national': {
			'pet': new Set(),
			'all': new Set()
		}
	}

	for (const charity of charities) {
		if (charity.featured === undefined) {
			continue;
		}

		if (searchConditions.pet(charity, profile) === true) {
			if (searchConditions.state(charity, profile) === true) {
				buckets.state.pet.add(charity);
			}
	
			if (searchConditions.national(charity, profile) === true) {
				buckets.national.pet.add(charity);
			}
		}

		if (searchConditions.state(charity, profile) === true) {
			buckets.state.all.add(charity);
		}

		if (searchConditions.national(charity, profile) === true) {
			buckets.national.all.add(charity);
		}
	}

	return buckets;
}

function findCharity(searchBuckets: Set<Charity>[]): Charity|undefined {
	for (const bucket of searchBuckets) {
		const [charity] = bucket;

		if (charity === undefined) {
			continue;
		}

		return charity;
	}
}

function determineSearchBuckets(buckets: CharityFeaturedBuckets, prioritySearchMode: PrioritySearchMode, featuredSearchMode: FeaturedSearchMode): Set<Charity>[] {
	const searchBuckets = [];

	if (prioritySearchMode & PrioritySearchMode.Pet) {
		if (featuredSearchMode & FeaturedSearchMode.State) {
			searchBuckets.push(buckets.state.pet);
		}

		if (featuredSearchMode & FeaturedSearchMode.National) {
			searchBuckets.push(buckets.national.pet);
		}

		return searchBuckets;
	}

	if (featuredSearchMode & FeaturedSearchMode.State) {
		searchBuckets.push(buckets.state.all);
	}

	if (featuredSearchMode & FeaturedSearchMode.National) {
		searchBuckets.push(buckets.national.all);
	}

	return searchBuckets;
}

function searchBuckets(featuredBuckets: CharityFeaturedBuckets, profile: Profile, targetCounts: CharityCounts): Charity[] {
	const currentCounts: CharityCounts = {
		'state': 0,
		'pet': 0,
		'total': 0
	}

	const charities = [];

	for (let index = 0; index < targetCounts.total; index++) {
		const prioritySearchMode = determinePrioritySearchMode(currentCounts, targetCounts);
		const featuredSearchMode = determineFeaturedSearchMode(currentCounts, targetCounts, prioritySearchMode);
		const searchBuckets = determineSearchBuckets(featuredBuckets, prioritySearchMode, featuredSearchMode);
		const charity = findCharity(searchBuckets);

		if (charity === undefined) {
			throw new Error('Charity result set within search constraints not found.');
		}

		for (const [_key, buckets] of Object.entries(featuredBuckets)) {
			for (const [_key, bucket] of Object.entries(buckets)) {
				bucket.delete(charity);
			}
		}

		if (searchConditions.pet(charity, profile) === true) {
			currentCounts.pet++;
		}

		if (searchConditions.state(charity, profile) === true) {
			currentCounts.state++;
		}

		currentCounts.total++;
		charities.push(charity);
	}

	return charities;
}

function pickCharities(charities: Charity[], profile: Profile, targetCounts: CharityCounts): Charity[] {
	const randomCharities = fastShuffle((Math.random() * 2 ** 32) | 0, charities);
	const buckets = createBuckets(randomCharities, profile);
	return searchBuckets(buckets, profile, targetCounts);
}

export default pickCharities;
