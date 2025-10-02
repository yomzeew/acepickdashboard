import { useNavigate } from 'react-router-dom';

import AuthContainer from '../../../components/auth/auth-container';
import { Button, Form, Input, Link } from '../../../components/controls';
import { LOGIN_PAGE, RESET_PASSWORD_VERIFY_PAGE } from '../../../config';
import { EmailIcon } from '../../../components/icons';

const rules = [{ required: true }];

export default function ResetPassword() {
	const [form] = Form.useForm();

	const email = Form.useWatch(['email'], form);

	const navigate = useNavigate();

	const loading = false;

	return (
		<AuthContainer
			heading="Forgot Password"
			title="Please enter your business email address."
		>
			<Form
				form={form}
				name="password-reset-form"
				onFinish={() => navigate(RESET_PASSWORD_VERIFY_PAGE)}
				className="my-3 py-3"
				disabled={loading}
			>
				<Form.Item
					name="email"
					rules={[
						...rules,
						{
							type: 'string',
						},
					]}
				>
					<Input
						icon={EmailIcon}
						label="Email Address"
						placeholder="Enter your email"
						size="large"
					/>
				</Form.Item>

				<Button
					block
					disabled={!email}
					size="large"
					type="primary"
					className="mt-2"
				>
					{loading ? 'Sending...' : 'Request password reset'}
				</Button>

				<p className="login-description mt-3 text-center">
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
