import React from 'react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';

export default function useNavigate() {
	const routerNavigate = useRouterNavigate();

	const navigate = React.useCallback(
		(route: string) => {
			routerNavigate(route);
		},
		[routerNavigate]
	);

	const goBack = React.useCallback(() => {
		routerNavigate(-1);
	}, [routerNavigate]);

	return {
		navigate,
		goBack,
	};
}
