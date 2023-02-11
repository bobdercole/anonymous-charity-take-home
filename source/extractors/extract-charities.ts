import { createReadStream } from 'fs'
import { parse } from 'csv-parse';
import isUnknownObject from './is-unknown-object';
import Charity from '../interfaces/charity';

function isCharity(argument: unknown): argument is Charity {
	return isUnknownObject(argument)
		&& typeof argument.id === 'number'
		&& typeof argument.name === 'string'
		&& (argument.state === undefined
			|| typeof argument.state === 'string')
		&& typeof argument.category === 'string'
		&& (argument.featured === undefined
			|| typeof argument.featured === 'string')
};

function transform(argument: unknown): Record<string, unknown> {
	if (!(isUnknownObject(argument)
		&& typeof argument.id === 'string'
		&& typeof argument.state === 'string'
		&& typeof argument.featured === 'string')) {
		throw new TypeError('CSV row is not tranformable.');
	}

	return Object.assign({}, argument, {
		id: parseInt(argument.id),
		state: argument.state === '' ? undefined : argument.state,
		featured: argument.featured === '' ? undefined : argument.featured
	});
}

async function extractCharities(path: string): Promise<Charity[]> {
	const charities = createReadStream(path).pipe(parse({
		columns: true
	}));

	const transformedCharities = [];

	for await (const charity of charities) {
		const transformedCharity = transform(charity);

		if (!isCharity(transformedCharity)) {
			throw new TypeError('CSV row is not a charity.');
		}

		transformedCharities.push(transformedCharity);
	}

	return transformedCharities;
}

export default extractCharities;
