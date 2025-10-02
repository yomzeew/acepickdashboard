import { useNavigate } from 'react-router-dom';
import AuthContainer from '../../../components/auth/auth-container';
import {
	Button,
	Form,
	Input,
	Link,
} from '../../../components/controls';
import { EMAIL_VERIFY_PAGE, LOGIN_PAGE } from '../../../config';
import { useLoginMutation } from '../../../store/queries/auth';
const rules = [{ required: true }];
function Finalstagefinal() {
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
			heading="Finishing Registration"
			title="Enter your account details to login"
		>
			<Form
				form={form}
				name="register-form"
				onFinish={(values) => onSubmit(values)}
				disabled={loading}
			>
				<Form.Item
					name="numberofstation"
					rules={rules}
				>
					<Input
          type='number'
						label="Number of Stations"
						placeholder="Number of Stations"
						size="large"
					/>
				</Form.Item>
				<Form.Item name="placeholder1" rules={rules}>
					<Input
						label="Placeholder1"
						placeholder="Placeholder1"
						size="large"
					/>
				</Form.Item>
        <Form.Item name="placeholder2" rules={rules}>
					<Input
						label="Placeholder2"
						placeholder="Placeholder2"
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
						{loading ? 'Registering...' : 'Finish'}
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

export default Finalstagefinal;
