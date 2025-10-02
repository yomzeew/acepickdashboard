import { useNavigate } from 'react-router-dom';
import AuthContainer from '../../../components/auth/auth-container';
import {
	Button,
	Form,
	Input,
	Link,
  Textarea,
} from '../../../components/controls';
import { LOGIN_PAGE, REGISTER_PAGE_FINAL_STAGE_FINAL } from '../../../config';
import { useLoginMutation } from '../../../store/queries/auth';
import {PhoneIcon, UserIcon } from '../../../components/icons';

const rules = [{ required: true }];

function Finalstage() {
  const navigate = useNavigate();

	const [form] = Form.useForm();
	const phonenumber = Form.useWatch(['phonenumber'], form);
	const address = Form.useWatch(['address'], form);

	const { mutate: onSubmit, isPending: loading } = useLoginMutation({
		onSuccess() {
			// login({});
      console.log('ok')
			navigate(REGISTER_PAGE_FINAL_STAGE_FINAL);
		},
	});

	return (
		<AuthContainer
			containerClassName="register-container"
			heading="Finishing Registration"
			title="Enter your company details to complete your registration"
		>
			<Form
				form={form}
				name="register-form"
				onFinish={(values) => onSubmit(values)}
				disabled={loading}
			>
				<Form.Item
					name="phonenumber"
					rules={rules}
				>
					<Input
						icon={PhoneIcon}
						label="Phone Number"
						placeholder="Phone Number"
						size="large"
					/>
				</Form.Item>

				<Form.Item name="address" rules={rules}>
					<Textarea
						label="Address"
						placeholder="Enter Address"
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
						disabled={!phonenumber || !address}
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

export default Finalstage;
