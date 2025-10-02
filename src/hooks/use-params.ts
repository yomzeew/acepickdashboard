import { useParams as useRouteParams } from 'react-router-dom';

export default function useParams() {
	const result = useRouteParams();
	return result;
}
