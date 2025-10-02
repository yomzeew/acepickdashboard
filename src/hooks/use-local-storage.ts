import React from 'react';

type LocalStorageOptions<T = string> = {
	initialValue?: T;
	type?: 'string' | 'number' | 'array' | 'object' | 'boolean';
};

function useLocalStorage<T = any>(
	key: string,
	options: LocalStorageOptions<T> = {
		type: 'string',
	}
) {
	const [value, setValue] = React.useState<T | null>(() => {
		const result = localStorage.getItem(key);
		const parsedType: LocalStorageOptions['type'][] = [
			'array',
			'boolean',
			'object',
		];
		if (result)
			return parsedType.includes(options.type)
				? JSON.parse(result)
				: options.type === 'number'
				? +result
				: result;
		return options.initialValue || null;
	});

	const changeValue = React.useCallback(
		(value: T | null) => {
			setValue(value);
			const isObjOrArrayOrBool =
				typeof value === 'object' || typeof value === 'boolean';
			localStorage.setItem(
				key,
				isObjOrArrayOrBool ? JSON.stringify(value) : String(value)
			);
		},
		[key]
	);

	const removeItem = React.useCallback(() => {
		setValue(null);
		localStorage.removeItem(key);
	}, [key]);

	return {
		value,
		setValue: changeValue,
		removeValue: removeItem,
	};
}

export default useLocalStorage;
