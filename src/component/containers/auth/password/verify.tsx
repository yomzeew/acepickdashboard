import { ExclamationCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import AuthContainer from '../../../components/auth/auth-container';
import { Button, Form, InputOTP, Link } from '../../../components/controls';
import { LOGIN_PAGE, RESET_PASSWORD_CONFIRM_PAGE } from '../../../config';

const rules = [{ required: true }];

function PasswordOTP() {
	const [form] = Form.useForm();
	const navigate = useNavigate();

	const token = Form.useWatch(['token'], form);

	const loading = false;

	return (
		<AuthContainer
			heading="Verify Password"
			title={`Enter verification code sent to your email address`}
		>
			<Form
				form={form}
				layout="vertical"
				className="my-3 py-3"
				name="verify-password-reset-form"
				onFinish={() => navigate(RESET_PASSWORD_CONFIRM_PAGE)}
				disabled={loading}
				validateTrigger="onSubmit"
			>
				<Form.Item name="token" rules={rules}>
					<InputOTP
						label="Enter OTP sent to your mail"
						onChange={() => {
							// console.log(value);
							navigate(RESET_PASSWORD_CONFIRM_PAGE);
						}}
					/>
				</Form.Item>

				<p className="bg-gray-200 rounded-md p-4 login-description my-4 text-left flex items-center justify-start">
					<ExclamationCircleFilled className="primary-text-color mx-1" />
					Didn&apos;t receive a mail?
					<span
						// onClick={!resetLoading ? () => onResetAgain(email) : undefined}
						className="cursor-pointer ml-1 primary-text-color hover:underline"
					>
						Resend
					</span>
				</p>

				<div>
					<Button block disabled={!token} size="large" type="primary">
						Confirm Email
					</Button>
				</div>
				<p className="login-description mt-2 text-center">
					Remember Password?{' '}
					<Link to={LOGIN_PAGE}>
						<span className="align-baseline capitalize cursor-pointer font-medium font-size-base primary-text-color">
							Login Here
						</span>
					</Link>
				</p>
			</Form>
		</AuthContainer>
	);
}

export default PasswordOTP;
