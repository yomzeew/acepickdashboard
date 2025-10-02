import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Avatar, Space, Input, Select, Modal, Tabs,App } from 'antd';
import { 
  UserOutlined, 
  EyeOutlined, 
  CheckCircleOutlined,
  PhoneOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchClients, 
  fetchProfessionals, 
  fetchRiders, 
  verifyUser,
  setSelectedUser,
  toggleSuspendUser 
} from '../store/slices/userSlice';


const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { clients, professionals, riders, loading, selectedUser } = useAppSelector((state) => state.users);
  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userDetailModal, setUserDetailModal] = useState(false);

  useEffect(() => {
    dispatch(fetchClients({}));
    dispatch(fetchProfessionals({}));
    dispatch(fetchRiders({}));
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = { search: value, status: statusFilter !== 'all' ? statusFilter : undefined };
    
    switch (activeTab) {
      case 'clients':
        dispatch(fetchClients(params));
        break;
      case 'professionals':
        dispatch(fetchProfessionals(params));
        break;
      case 'riders':
        dispatch(fetchRiders(params));
        break;
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const params = { search: searchTerm || undefined, status: status !== 'all' ? status : undefined };
    
    switch (activeTab) {
      case 'clients':
        dispatch(fetchClients(params));
        break;
      case 'professionals':
        dispatch(fetchProfessionals(params));
        break;
      case 'riders':
        dispatch(fetchRiders(params));
        break;
    }
  };

  const handleUpdateStatus = async (userId: string, selectedStatus: string, userType: 'client' | 'professional' | 'delivery') => {
    try {
      // Find the current user to check their status
      let currentUser = null;
      let userArray: any[] = [];

      switch (userType) {
        case 'client':
          userArray = clients;
          break;
        case 'professional':
          userArray = professionals;
          break;
        case 'delivery':
          userArray = riders;
          break;
      }

      currentUser = userArray.find(user => user.id === userId);

      // Only toggle if the status is different
      if (currentUser && currentUser.status !== selectedStatus) {
        const result = await dispatch(toggleSuspendUser({ userId, userType })).unwrap();

        if (result?.user?.data === 'User suspended successfully') {
          message.success('User suspended successfully');
        } else {
          message.success('User activated successfully');
        }

        // Refresh the data to reflect changes
        switch (userType) {
          case 'client':
            dispatch(fetchClients({ search: searchTerm || undefined, status: statusFilter !== 'all' ? statusFilter : undefined }));
            break;
          case 'professional':
            dispatch(fetchProfessionals({ search: searchTerm || undefined, status: statusFilter !== 'all' ? statusFilter : undefined }));
            break;
          case 'delivery':
            dispatch(fetchRiders({ search: searchTerm || undefined, status: statusFilter !== 'all' ? statusFilter : undefined }));
            break;
        }
      } else {
        message.info('User is already in the selected status');
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to update user status');
    }
  };

  const handleVerifyUser = async (userId: string, userType: 'client' | 'professional' | 'delivery') => {
    try {
      await dispatch(verifyUser({ userId, userType })).unwrap();
      message.success('User verified successfully');
    } catch (error) {
      message.error('Failed to verify user');
    }
  };

  const showUserDetails = (user: any) => {
    dispatch(setSelectedUser(user));
    setUserDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'SUSPENDED': return 'orange';
      case 'INACTIVE': return 'red';
      default: return 'blue';
    }
  };

  // === Shared columns ===
  const baseColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: any) => {
        const name = record?.profile
          ? `${record.profile.firstName || ''} ${record.profile.lastName || ''}`.trim()
          : record?.email?.split('@')[0] || 'User';

        return (
          <div className="flex items-center">
            <Avatar 
              src={record?.profile?.avatar} 
              icon={<UserOutlined />} 
              className="mr-3" 
            />
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-gray-500 text-sm">{record?.email || 'No email'}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Verified',
      dataIndex: ['profile', 'verified'],
      key: 'verified',
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'red'}>
          {verified ? 'Verified' : 'Unverified'}
        </Tag>
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
  ];

  // === Clients table ===
  const clientColumns = [
    ...baseColumns,
    {
      title: 'Total Jobs',
      dataIndex: ['profile', 'totalJobs'],
      key: 'totalJobs',
    },
    {
      title: 'Total Expense',
      dataIndex: ['profile', 'totalExpense'],
      key: 'totalExpense',
      render: (amount: number) => amount ? `₦${amount.toLocaleString()}` : '₦0',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showUserDetails(record)} />
          <Button icon={<MessageOutlined />} />
          <Button icon={<PhoneOutlined />} />
          {!record?.profile?.verified && (
            <Button 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleVerifyUser(record.id, 'client')}
            />
          )}
          <Select
            defaultValue={record?.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'}
            onChange={(status) => handleUpdateStatus(record.id, status, 'client')}
          >
            <Option value="ACTIVE">Active</Option>
            <Option value="SUSPENDED">Suspend</Option>
          </Select>
        </Space>
      ),
    },
  ];

  // === Professionals table ===
  const professionalColumns = [
    ...baseColumns,
    {
      title: 'Rating',
      dataIndex: ['profile', 'rate'],
      key: 'rate',
      render: (rating: string) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{rating || '0'}</span>
        </div>
      ),
    },
    {
      title: 'Completed Jobs',
      dataIndex: ['profile', 'totalJobsCompleted'],
      key: 'totalJobsCompleted',
    },
    {
      title: 'Ongoing Jobs',
      dataIndex: ['profile', 'totalJobsOngoing'],
      key: 'totalJobsOngoing',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showUserDetails(record)} />
          <Button icon={<MessageOutlined />} />
          <Button icon={<PhoneOutlined />} />
          {!record?.profile?.verified && (
            <Button 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleVerifyUser(record.id, 'professional')}
            />
          )}
          <Select
            defaultValue={record?.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'}
            onChange={(status) => handleUpdateStatus(record.id, status, 'professional')}
          >
            <Option value="ACTIVE">Active</Option>
            <Option value="SUSPENDED">Suspend</Option>
          </Select>
        </Space>
      ),
    },
  ];

  // === Riders table ===
  const riderColumns = [
    ...baseColumns,
    {
      title: 'Rating',
      dataIndex: ['profile', 'rate'],
      key: 'rate',
      render: (rating: string) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{rating || '0'}</span>
        </div>
      ),
    },
    {
      title: 'Completed Deliveries',
      dataIndex: ['profile', 'totalJobsCompleted'],
      key: 'totalJobsCompleted',
    },
    {
      title: 'Ongoing Deliveries',
      dataIndex: ['profile', 'totalJobsOngoing'],
      key: 'totalJobsOngoing',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showUserDetails(record)} />
          <Button icon={<MessageOutlined />} />
          <Button icon={<PhoneOutlined />} />
          {!record?.profile?.verified && (
            <Button 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleVerifyUser(record.id, 'delivery')}
            />
          )}
          <Select
            defaultValue={record?.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'}
            onChange={(status) => handleUpdateStatus(record.id, status, 'delivery')}
          >
            <Option value="ACTIVE">Active</Option>
            <Option value="SUSPENDED">Suspend</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage clients, professionals, and riders</p>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Search
              placeholder="Search users..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="SUSPENDED">Suspended</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Clients (${clients.length})`} key="clients">
            <Table
              columns={clientColumns}
              dataSource={clients}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
            />
          </TabPane>
          
          <TabPane tab={`Professionals (${professionals.length})`} key="professionals">
            <Table
              columns={professionalColumns}
              dataSource={professionals}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
            />
          </TabPane>
          
          <TabPane tab={`Delivery (${riders.length})`} key="riders">
            <Table
              columns={riderColumns}
              dataSource={riders}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        open={userDetailModal}
        onCancel={() => setUserDetailModal(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar size={64} src={selectedUser?.profile?.avatar} icon={<UserOutlined />} />
              <div>
                <h3 className="text-lg font-medium">{selectedUser?.profile?.firstName} {selectedUser?.profile?.lastName}</h3>
                <p className="text-gray-600">{selectedUser?.email}</p>
                <Tag color={getStatusColor(selectedUser?.status)}>
                  {selectedUser?.status}
                </Tag>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p>{selectedUser?.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Join Date</label>
                <p>{new Date(selectedUser?.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Verified</label>
                <p>{selectedUser?.profile?.verified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Jobs</label>
                <p>{selectedUser?.profile?.totalJobs || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <p>{selectedUser?.profile?.rate || '0'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
