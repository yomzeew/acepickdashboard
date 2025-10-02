import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag,  Spin, Modal, Button } from 'antd';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  TruckOutlined, 
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboardActivities, fetchDashboardOverview, fetchTopPerformers } from '../store/slices/dashboardSlice';
import UserDetails from './userDetails';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

 
  const [activityPage, setActivityPage] = useState(1);
  const [performerPage, setPerformerPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 5;

  const { overview, activities, topPerformers, loading: dashboardLoading } = useAppSelector(
    (state) => state.dashboard
  );

  const paginatedPerformers = topPerformers?.slice(
    (performerPage - 1) * limit,
    performerPage * limit
  );

  const handlePreview = (record: any) => {
    setSelectedUser(record);
    setIsModalOpen(true);
  };
  console.log(topPerformers, 'topPerformers')

  useEffect(() => {
    dispatch(fetchDashboardOverview());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardActivities({ status: 'all', page: activityPage, limit }));
  }, [dispatch, activityPage]);

  useEffect(() => {
    dispatch(fetchTopPerformers());
  }, [dispatch, performerPage]);

  const activityColumns = [
    {
      title: 'S/N',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Action',
      dataIndex: 'description',
      key: 'descriptionn',
      
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          success: 'green',
          failed: 'red',
          pending: 'orange',
          processing: 'blue',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
  ];

  const performerColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{role}</span>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: string) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{Number(rating)}</span>
        </div>
      ),
    },
    {
      title: 'Total Jobs',
      dataIndex: 'totaljobs',
      key: 'totaljobs',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => handlePreview(record)}>
          Preview
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={dashboardLoading}>
      <Modal
  title="User Details"
  open={isModalOpen}
  onCancel={() => setIsModalOpen(false)}
  footer={null}
  width={600}
>
  <UserDetails user={selectedUser} />
</Modal>

      <div className={`p-6 w-full`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome to AcePick Admin Panel</p>
        </div>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={overview?.totalUsers || 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Orders"
                value={overview?.totalOrders || 0}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Deliveries"
                value={overview?.activeDeliveries || 0}
                prefix={<TruckOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Monthly Revenue (₦)"
                value={overview?.monthlyRevenue || 0}
                precision={2}
                formatter={(value) =>
                  new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                    .format(Number(value))
                    .replace('NGN', '₦')
                }
              />
            </Card>
          </Col>
        </Row>

        {/* User Distribution */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card title="User Distribution" className="h-full">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Clients</span>
                    <span>{overview?.totalClients || 0}</span>
                  </div>
                  <Progress percent={overview ? (overview.totalClients / overview.totalUsers) * 100 : 0} strokeColor="#10b981" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Professionals</span>
                    <span>{overview?.totalProfessionals || 0}</span>
                  </div>
                  <Progress percent={overview ? (overview.totalProfessionals / overview.totalUsers) * 100 : 0} strokeColor="#3b82f6" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Riders</span>
                    <span>{overview?.totalRiders || 0}</span>
                  </div>
                  <Progress percent={overview ? (overview.totalRiders / overview.totalUsers) * 100 : 0} strokeColor="#f59e0b" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="System Health" className="h-full">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Server Performance</span>
                    <span>Excellent</span>
                  </div>
                  <Progress percent={95} strokeColor="#10b981" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Database Health</span>
                    <span>Good</span>
                  </div>
                  <Progress percent={87} strokeColor="#10b981" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>API Response Time</span>
                    <span>Fast</span>
                  </div>
                  <Progress percent={92} strokeColor="#10b981" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Activities and Top Performers */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="Recent Activities" className="h-full">
              <Table
                rowKey="id"
                columns={activityColumns}
                dataSource={activities?.rows || []}
                pagination={{
                  current: activityPage,
                  pageSize: limit,
                  total: activities?.count || 0,
                  onChange: (page) => setActivityPage(page),
                }}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Top Performers" className="h-full">
            <Table
  rowKey="id"
  columns={performerColumns}
  dataSource={paginatedPerformers || []}
  pagination={{
    current: performerPage,
    pageSize: limit,
    total: topPerformers?.length || 0, // derive count from array length
    onChange: (page) => setPerformerPage(page),
  }}
  size="small"
/>

            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard;
