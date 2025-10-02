import React from 'react';

// Our hook
export default function useDebounce<T = any>(
	value: T,
	delay = 1000,
	options?: {
		onDebounce?: (value: T) => void;
	}
) {
	const { onDebounce } = options || {};

	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(
		() => {
			// Set debouncedValue to value (passed in) after the specified delay
			const handler = setTimeout(() => {
				setDebouncedValue(value);
				if (onDebounce) onDebounce(value);
			}, delay);

			// Return a cleanup function that will be called every time ...
			// ... useEffect is re-called. useEffect will only be re-called ...
			// ... if value changes (see the inputs array below).
			// This is how we prevent debouncedValue from changing if value is ...
			// ... changed within the delay period. Timeout gets cleared and restarted.
			// To put it in context, if the user is typing within our app's ...
			// ... search box, we don't want the debouncedValue to update until ...
			// ... they've stopped typing for more than 500ms.
			return () => {
				clearTimeout(handler);
			};
		},
		// Only re-call effect if value changes
		// You could also add the "delay" var to inputs array if you ...
		// ... need to be able to change that dynamically.
		[value, delay, onDebounce]
	);

	return debouncedValue;
}
