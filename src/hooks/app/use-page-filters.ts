import React from 'react';

import { DEFAULT_PAGINATION_SIZE } from '~/config/app';
import { dates } from '~/utils';

import useDebouncedSearchParamInput from './use-debounced-search-param-input';
import useSearchParams from '../use-search-params';

export default function usePageFilters(options?: {
	prefix?: string;
	// Note: Please provide this optional prefix to mostly avoid re-renders and differentiate search params
	// when this hook is used multiple times in the same component or a parent component
}) {
	const debouncedSearchInput = useDebouncedSearchParamInput({
		prefix: options?.prefix,
	});

	const searchParams = useSearchParams({ prefix: options?.prefix });

	const keys = React.useMemo(() => {
		const prefix = options?.prefix ? options.prefix + '_' : '';

		return {
			status: prefix + 'status',
			page: prefix + 'page',
			limit: prefix + 'limit',
			from: prefix + 'from',
			to: prefix + 'to',
			search: prefix + 'search',
		};
	}, [options?.prefix]);

	const pageFilters = React.useMemo(() => {
		let page = +(searchParams.get(keys.page) || '1');
		if (!page || isNaN(+page) || page < 1) page = 1;

		let pageSize = +(searchParams.get(keys.limit) || DEFAULT_PAGINATION_SIZE);
		if (!pageSize || isNaN(+pageSize) || pageSize < 1)
			pageSize = DEFAULT_PAGINATION_SIZE;

		const fromParam = searchParams.get(keys.from);
		const toParam = searchParams.get(keys.to);
		const from = fromParam
			? dates.getDate<'dayjs'>(fromParam, 'dayjs')
			: undefined;
		const to = toParam ? dates.getDate<'dayjs'>(toParam, 'dayjs') : undefined;
		const status = searchParams.get(keys.status);

		const pagination = {
			pageIndex: page - 1,
			pageSize,
		};

		return {
			pagination,
			from,
			to,
			status,
		};
	}, [searchParams, keys]);

	const filters = React.useMemo(() => {
		return {
			limit: pageFilters.pagination.pageSize,
			page: pageFilters.pagination.pageIndex + 1,
			search: debouncedSearchInput.debouncedValue,
			from: pageFilters.from
				? pageFilters.from.format('YYYY-MM-DD')
				: undefined,
			to: pageFilters.to ? pageFilters.to.format('YYYY-MM-DD') : undefined,
			status: pageFilters.status,
		};
	}, [pageFilters, debouncedSearchInput]);

	return {
		keys,
		search: debouncedSearchInput.debouncedValue,
		searchInput: {
			onChange: debouncedSearchInput.onChange,
			value: debouncedSearchInput.value,
		},
		searchParams,
		filters,
		...pageFilters,
	};
}
