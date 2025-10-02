import React from 'react';
import { Descriptions, Avatar, Tag, Button, Space,App } from 'antd';
import { useAppDispatch } from '../store/hooks';
import { toggleSuspendUser } from '../store/slices/userSlice';

interface UserDetailsProps {
  user: any;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = React.useState(user.status); // local state
  const { message } = App.useApp(); // ✅ correct way to use message with theme
  
  if (!user) return null;

  const handleToggleSuspend = async () => {
    try {
      const result = await dispatch(toggleSuspendUser({
        userId: user.userid,
        userType: user.role
      })).unwrap();

      if (result?.user?.data === 'User suspended successfully') {
        message.success('User suspended successfully');
        setStatus('SUSPENDED');
      } else {
        message.success('User activated successfully');
        setStatus('ACTIVE');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'suspended':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <Descriptions title="User Information" bordered column={1} size="small">
        <Descriptions.Item label="Avatar">
          <Avatar src={user.avatar} size={64} />
        </Descriptions.Item>
        <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Phone">{user.phone || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Role">
          <Tag color="blue">{user.role}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Rating">⭐ {user.rating}</Descriptions.Item>
        <Descriptions.Item label="Total Jobs">{user.totaljobs || 0}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(status)}>{status}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <div className="mt-4">
        <Space>
          <Button
            type="primary"
            danger={status === 'ACTIVE'}
            onClick={handleToggleSuspend}
          >
            {status === 'SUSPENDED' ? 'Reactivate User' : 'Suspend User'}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default UserDetails;
