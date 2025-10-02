import { useNavigate } from 'react-router-dom';

import AuthContainer from '../../../components/auth/auth-container';
import {
	Button,
	Form,
	InputPassword,
	Link,
} from '../../../components/controls';
import { LOGIN_PAGE, RESET_PASSWORD_SUCCESS_PAGE } from '../../../config';
import { PasswordIcon } from '../../../components/icons';

const rules = [{ required: true }];

export default function ComfirmResetPassword() {
	const [form] = Form.useForm();

	const password1 = Form.useWatch(['password1'], form);
	const password2 = Form.useWatch(['password2'], form);

	const navigate = useNavigate();

	const loading = false;

	return (
		<AuthContainer heading="Reset Password" title="Enter your new password">
			<Form
				form={form}
				name="confirm-password-reset-form"
				onFinish={() => navigate(RESET_PASSWORD_SUCCESS_PAGE)}
				className="my-3 py-3"
				disabled={loading}
			>
				<Form.Item name="password1" rules={rules}>
					<InputPassword
						icon={PasswordIcon}
						label="Enter New Password"
						placeholder="Enter password"
						size="large"
					/>
				</Form.Item>

				<Form.Item name="password2" rules={rules}>
					<InputPassword
						icon={PasswordIcon}
						label="Confirm Password"
						placeholder="Confirm password"
						size="large"
					/>
				</Form.Item>

				<Button
					block
					disabled={!password1 || !password2}
					size="large"
					type="primary"
					className="mt-2"
				>
					{loading ? 'Saving...' : 'Change Password'}
				</Button>

				<p className="login-description mt-4 text-center">
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
