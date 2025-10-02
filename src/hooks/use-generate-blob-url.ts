import React from 'react';

function useGenerateBlobUrl() {
	const [data, setData] = React.useState<{
		url?: string;
		title?: string;
		location?: string;
	}>();
	const [error, setError] = React.useState(null);
	const [loading, setLoading] = React.useState(false);

	const generateUrl = React.useCallback(() => {
		setLoading(true);
		setError(null);
		setTimeout(() => {
			setLoading(false);
			setData(undefined);
		}, 1500);
	}, []);

	return {
		data,
		error,
		loading,
		generateUrl,
	};
}

export default useGenerateBlobUrl;
