import React from 'react';

const useOutClick = <
	Container extends HTMLElement,
	Button extends HTMLElement = HTMLDivElement
>(options?: {
	shouldClose?: boolean;
}) => {
	const [visible, setVisible] = React.useState<boolean>(false);
	const ref = React.useRef<Container>(null);
	const buttonRef = React.useRef<Button>(null);

	const { shouldClose = true } = options || {};

	const handleMouseClick = React.useCallback(
		({ target }: Event): void => {
			if (shouldClose) {
				if (
					ref.current &&
					typeof ref.current.contains === 'function' &&
					!ref.current.contains(target as Element)
				) {
					// check if there's a button ref
					if (buttonRef.current) {
						if (
							typeof buttonRef.current.contains === 'function' &&
							!buttonRef.current.contains(target as Element)
						) {
							setVisible(false);
						}
					} else setVisible(false);
				}
			}
		},
		[shouldClose]
	);

	React.useEffect(() => {
		document.addEventListener('click', handleMouseClick, true);

		return () => document.removeEventListener('click', handleMouseClick, true);
	}, [handleMouseClick]);

	return {
		buttonRef,
		ref,
		setVisible,
		visible,
	};
};

export default useOutClick;
