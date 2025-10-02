import { useNavigate } from 'react-router-dom';

import AuthContainer from '../../../components/auth/auth-container';
import { Button } from '../../../components/controls';
import { HOME_PAGE, LOGO_IMAGE } from '../../../config';
import { useAuthContext } from '../../../store/contexts';
import { useLoginMutation } from '../../../store/queries/auth';

export default function EmailVerificationSuccess() {
	const navigate = useNavigate();
	const { login } = useAuthContext();

	const { mutate: onSubmit, isPending: loading } = useLoginMutation({
		onSuccess() {
			login({});
			navigate(HOME_PAGE);
		},
	});

	return (
		<AuthContainer
			heading={
				<div className="flex flex-col items-center">
					<img className="h-[30px] mb-8 w-[30px]" src={LOGO_IMAGE} alt="" />
					<span className="inline-block mt-0">Successful</span>
				</div>
			}
			title="Your account creation is successful"
		>
			<div className="my-3 py-3">
				<Button
					block
					disabled={loading}
					size="large"
					type="primary"
					onClick={() => onSubmit({})}
				>
					Login to your account
				</Button>
			</div>
		</AuthContainer>
	);
}
