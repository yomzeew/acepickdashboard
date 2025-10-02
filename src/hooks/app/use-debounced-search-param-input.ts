import React from 'react';

import useDebounce from '../use-debounce';
import useSearchParams from '../use-search-params';

export default function useDebouncedSearchParamInput(options?: {
	prefix?: string;
	// Note: Please provide this optional prefix to mostly avoid re-renders and differentiate search params
	// when this hook is used multiple times in the same component or a parent component
}): {
	debouncedValue: string | undefined;
	value: string | undefined;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} {
	const key = React.useMemo(() => {
		if (options?.prefix) {
			return options.prefix + '_search';
		}
		return 'search';
	}, [options?.prefix]);

	const searchParams = useSearchParams();
	const search = React.useMemo(
		() => searchParams.get(key),
		[searchParams, key]
	);

	const [searchValue, setSearchValue] = React.useState(() => {
		return searchParams.get(key) || undefined;
	});

	// Delay the search
	useDebounce(searchValue, undefined, {
		onDebounce: (value) => {
			if (value === undefined && !search) return;
			if (search !== value) {
				if (value === undefined) searchParams.remove(key);
				else searchParams.set(key, value);
			}
		},
	});

	return {
		value: searchValue,
		onChange: (e) => setSearchValue(e.target.value),
		debouncedValue: search || undefined,
	};
}
