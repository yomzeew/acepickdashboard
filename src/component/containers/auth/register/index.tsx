import { useNavigate } from 'react-router-dom';

import AuthContainer from '../../../components/auth/auth-container';
import {
	Button,
	Form,
	Input,
	InputPassword,
	Link,
} from '../../../components/controls';
import { EMAIL_VERIFY_PAGE, LOGIN_PAGE } from '../../../config';
import { useLoginMutation } from '../../../store/queries/auth';
import { EmailIcon, PasswordIcon, UserIcon } from '../../../components/icons';

const rules = [{ required: true }];

export default function Register() {
	const navigate = useNavigate();

	const [form] = Form.useForm();
	const email = Form.useWatch(['email'], form);
	const password = Form.useWatch(['password'], form);

	const { mutate: onSubmit, isPending: loading } = useLoginMutation({
		onSuccess() {
			// login({});
			navigate(EMAIL_VERIFY_PAGE);
		},
	});

	return (
		<AuthContainer
			containerClassName="register-container"
			heading="Create account"
			title="Enter company details to setup an account"
		>
			<Form
				form={form}
				name="register-form"
				onFinish={(values) => onSubmit(values)}
				disabled={loading}
			>
				<Form.Item
					name="email"
					rules={[
						...rules,
						{
							type: 'email',
						},
					]}
				>
					<Input
						icon={EmailIcon}
						label="Email Address"
						placeholder="Email Address"
						size="large"
					/>
				</Form.Item>

				<Form.Item name="password" rules={rules}>
					<InputPassword
						icon={PasswordIcon}
						label="Password"
						placeholder="Enter Password"
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
				<Form.Item name="companyname" rules={rules}>
					<Input
						icon={UserIcon}
						label="Company Name"
						placeholder="Company Name"
						size="large"
					/>
				</Form.Item>

				<div className='mt-5'>
					<Button
						block
						disabled={!email || !password}
						size="large"
						type="primary"
					>
						{loading ? 'Registering...' : 'Continue'}
					</Button>
					<p className="register-description mt-2 text-center">
						Already have an account?{' '}
						<Link to={LOGIN_PAGE}>
							<span className="align-baseline cursor-pointer font-medium font-size-base primary-text-color">
								Sign In
							</span>
						</Link>
					</p>
				</div>
			</Form>
		</AuthContainer>
	);
}
