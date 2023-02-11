import { createReadStream } from 'fs'
import { parse } from 'csv-parse';
import isUnknownObject from './is-unknown-object';
import Profile from '../interfaces/profile';

function isProfile(argument: unknown): argument is Profile {
	return isUnknownObject(argument)
		&& typeof argument.id === 'number'
		&& typeof argument.name === 'string'
		&& typeof argument.state === 'string'
		&& typeof argument.isMarried === 'boolean'
		&& typeof argument.hasChildren === 'boolean'
		&& typeof argument.hasPets === 'boolean'
		&& typeof argument.age === 'number';
};

function transform(argument: unknown): Record<string, unknown> {
	if (!(isUnknownObject(argument)
		&& typeof argument.id === 'string'
		&& typeof argument.isMarried === 'string'
		&& typeof argument.hasChildren === 'string'
		&& typeof argument.hasPets === 'string'
		&& typeof argument.age === 'string')) {
		throw new TypeError('CSV row is not tranformable.');
	}

	return Object.assign({}, argument, {
		id: parseInt(argument.id),
		isMarried: argument.isMarried === 'TRUE',
		hasChildren: argument.hasChildren === 'TRUE',
		hasPets: argument.hasPets === 'TRUE',
		age: parseInt(argument.age)
	});
}

async function extractProfile(path: string): Promise<Profile> {
	const profiles = createReadStream(path).pipe(parse({
		columns: true
	}));

	for await (const profile of profiles) {
		const transformedProfile = transform(profile);

		if (!isProfile(transformedProfile)) {
			throw new TypeError('CSV row is not a profile.');
		}

		return transformedProfile;
	}

	throw new Error('Profile not found.');
}

export default extractProfile;
