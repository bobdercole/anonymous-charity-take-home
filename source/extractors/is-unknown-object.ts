// Helper function to aid with type guards for unknown.
// https://github.com/microsoft/TypeScript/issues/25720#issuecomment-533438205
function isUnknownObject(argument: unknown): argument is { [key in PropertyKey]: unknown } {
	return argument !== null && typeof argument === 'object';
};

export default isUnknownObject;
