import CharityCounts from './interfaces/charity-counts';
import Profile from './interfaces/profile';

function randomInclusive(minimum: number, maximum: number) {
	return Math.floor(Math.random() * (maximum - minimum + 1) + minimum);
}

interface Configuration {
	maximumStateCount: number;
	minimumPetCount: number;
	total: number;
}

function determineTargetCounts(profile: Profile, configuration: Configuration): CharityCounts {
	const stateCount = randomInclusive(1, configuration.maximumStateCount);
	const petCount = profile.hasPets === true ? randomInclusive(configuration.minimumPetCount, configuration.total) : 0;

	return {
		state: stateCount,
		pet: petCount,
		total: configuration.total
	};
}

export default determineTargetCounts;
