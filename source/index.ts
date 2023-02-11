import determineTargetCounts from './determine-target-counts';
import pickCharities from './pick-charities';
import extractCharities from './extractors/extract-charities';
import extractProfile from './extractors/extract-profile';

async function main() {
	const [, , charitiesPath, profilePath] = process.argv;
  
	if (charitiesPath === undefined) {
		throw new Error('Charities path is required.')
	}

	if (profilePath == undefined) {
		throw new Error('Profile path is required.')
	}

	const profile = await extractProfile(profilePath);
	const charities = await extractCharities(charitiesPath);

	const targetCountConfiguration = {
		'maximumStateCount': 5,
		'minimumPetCount': 4,
		'total': 12
	}

	const targetCounts = determineTargetCounts(profile, targetCountConfiguration);
	const pickedCharities = pickCharities(charities, profile, targetCounts);

	for (const pickedCharity of pickedCharities) {
		console.dir(pickedCharity);
	}
}
  
main();
