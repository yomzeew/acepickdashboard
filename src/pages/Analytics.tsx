import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Table, Progress, Tabs } from 'antd';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  UserOutlined, 
  DollarOutlined, 
  ShoppingCartOutlined, 
  TruckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchDashboardStats,
  fetchUserAnalytics,
  fetchRevenueAnalytics,
  fetchServiceAnalytics,
  fetchDeliveryAnalytics,
  setDateRange
} from '../store/slices/analyticsSlice';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const Analytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    dashboardStats, 
    userAnalytics, 
    revenueAnalytics, 
    serviceAnalytics, 
    deliveryAnalytics, 
    loading, 
    dateRange 
  } = useAppSelector((state) => state.analytics);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchUserAnalytics(dateRange));
    dispatch(fetchRevenueAnalytics(dateRange));
    dispatch(fetchServiceAnalytics(dateRange));
    dispatch(fetchDeliveryAnalytics(dateRange));
  }, [dispatch, dateRange]);

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      const newDateRange = {
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      };
      dispatch(setDateRange(newDateRange));
    }
  };

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 140 },
    { month: 'Mar', revenue: 48000, orders: 130 },
    { month: 'Apr', revenue: 61000, orders: 160 },
    { month: 'May', revenue: 55000, orders: 145 },
    { month: 'Jun', revenue: 67000, orders: 175 },
  ];

  const userGrowthData = [
    { month: 'Jan', clients: 450, professionals: 320, riders: 180 },
    { month: 'Feb', clients: 520, professionals: 380, riders: 220 },
    { month: 'Mar', clients: 580, professionals: 420, riders: 250 },
    { month: 'Apr', clients: 650, professionals: 480, riders: 290 },
    { month: 'May', clients: 720, professionals: 540, riders: 320 },
    { month: 'Jun', clients: 800, professionals: 600, riders: 350 },
  ];

  const categoryData = [
    { name: 'Home Services', value: 35, color: '#8884d8' },
    { name: 'Beauty & Wellness', value: 25, color: '#82ca9d' },
    { name: 'Tech Support', value: 20, color: '#ffc658' },
    { name: 'Delivery', value: 15, color: '#ff7c7c' },
    { name: 'Others', value: 5, color: '#8dd1e1' },
  ];

  const topPerformersColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Earnings',
      dataIndex: 'earnings',
      key: 'earnings',
      render: (earnings: number) => `$${earnings.toLocaleString()}`,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{rating}</span>
        </div>
      ),
    },
    {
      title: 'Services/Deliveries',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const topPerformersData = [
    { key: '1', name: 'Sarah Johnson', type: 'Professional', earnings: 12500, rating: 4.9, count: 45 },
    { key: '2', name: 'Mike Chen', type: 'Rider', earnings: 8900, rating: 4.8, count: 120 },
    { key: '3', name: 'Emily Davis', type: 'Professional', earnings: 11200, rating: 4.7, count: 38 },
    { key: '4', name: 'James Wilson', type: 'Rider', earnings: 7800, rating: 4.6, count: 95 },
    { key: '5', name: 'Lisa Brown', type: 'Professional', earnings: 9800, rating: 4.8, count: 32 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Track platform performance and generate insights</p>
        </div>
        <div className="flex space-x-4">
          <RangePicker onChange={handleDateRangeChange} />
          <Select defaultValue="monthly" style={{ width: 120 }}>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="yearly">Yearly</Option>
          </Select>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          {/* Key Metrics */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={dashboardStats?.totalRevenue || 456789}
                  prefix={'₦'}
                  precision={2}
                  suffix={
                    <span className="text-green-500 text-sm">
                      <ArrowUpOutlined /> 12.5%
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Active Users"
                  value={dashboardStats?.activeUsers || 1847}
                  prefix={<UserOutlined />}
                  suffix={
                    <span className="text-green-500 text-sm">
                      <ArrowUpOutlined /> 8.2%
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={dashboardStats?.totalOrders || 2456}
                  prefix={<ShoppingCartOutlined />}
                  suffix={
                    <span className="text-green-500 text-sm">
                      <ArrowUpOutlined /> 15.3%
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Deliveries"
                  value={dashboardStats?.totalDeliveries || 1234}
                  prefix={<TruckOutlined />}
                  suffix={
                    <span className="text-red-500 text-sm">
                      <ArrowDownOutlined /> 2.1%
                    </span>
                  }
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={16}>
              <Card title="Revenue Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Service Categories">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Performance Metrics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Platform Health">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Service Completion Rate</span>
                      <span>94%</span>
                    </div>
                    <Progress percent={94} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>On-time Delivery Rate</span>
                      <span>87%</span>
                    </div>
                    <Progress percent={87} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Customer Satisfaction</span>
                      <span>91%</span>
                    </div>
                    <Progress percent={91} strokeColor="#722ed1" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Dispute Resolution Rate</span>
                      <span>96%</span>
                    </div>
                    <Progress percent={96} strokeColor="#eb2f96" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top Performers">
                <Table
                  columns={topPerformersColumns}
                  dataSource={topPerformersData}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="User Analytics" key="users">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="New Users Today"
                  value={userAnalytics?.newUsersToday || 23}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="User Growth Rate"
                  value={userAnalytics?.userGrowthRate || 12.5}
                  suffix="%"
                  prefix={<ArrowUpOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="User Retention Rate"
                  value={userAnalytics?.userRetentionRate || 78.3}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          <Card title="User Growth Over Time">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clients" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="professionals" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="riders" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>

        <TabPane tab="Revenue Analytics" key="revenue">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Monthly Revenue"
                  value={revenueAnalytics?.monthlyRevenue || 67000}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Average Order Value"
                  value={245.67}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Commission Earned"
                  value={8950}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Revenue vs Orders">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Revenue by Category">
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span>{category.name}</span>
                        <span>${(category.value * 1000).toLocaleString()}</span>
                      </div>
                      <Progress percent={category.value} strokeColor={category.color} />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Service Analytics" key="services">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Services"
                  value={serviceAnalytics?.totalServices || 456}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Completion Rate"
                  value={serviceAnalytics?.serviceCompletionRate || 94.2}
                  suffix="%"
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Average Rating"
                  value={serviceAnalytics?.averageRating || 4.7}
                  precision={1}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Cancelled Services"
                  value={serviceAnalytics?.cancelledServices || 28}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Service Performance Metrics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Popular Service Categories</h4>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress percent={category.value} strokeColor={category.color} className="w-24" />
                        <span className="text-sm text-gray-600">{category.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-4">Service Quality Metrics</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>5 Star Reviews</span>
                      <span>68%</span>
                    </div>
                    <Progress percent={68} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>4 Star Reviews</span>
                      <span>22%</span>
                    </div>
                    <Progress percent={22} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>3 Star Reviews</span>
                      <span>7%</span>
                    </div>
                    <Progress percent={7} strokeColor="#faad14" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Below 3 Stars</span>
                      <span>3%</span>
                    </div>
                    <Progress percent={3} strokeColor="#ff4d4f" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="Delivery Analytics" key="delivery">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Deliveries"
                  value={deliveryAnalytics?.totalDeliveries || 1234}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="On-time Rate"
                  value={deliveryAnalytics?.onTimeDeliveryRate || 87.3}
                  suffix="%"
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Avg Delivery Time"
                  value={deliveryAnalytics?.averageDeliveryTime || 45}
                  suffix=" min"
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Completed Today"
                  value={89}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Delivery Performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Delivery Status Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Delivered', value: 78, color: '#52c41a' },
                        { name: 'In Transit', value: 15, color: '#1890ff' },
                        { name: 'Pending', value: 5, color: '#faad14' },
                        { name: 'Cancelled', value: 2, color: '#ff4d4f' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Delivered', value: 78, color: '#52c41a' },
                        { name: 'In Transit', value: 15, color: '#1890ff' },
                        { name: 'Pending', value: 5, color: '#faad14' },
                        { name: 'Cancelled', value: 2, color: '#ff4d4f' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="font-medium mb-4">Top Performing Riders</h4>
                <div className="space-y-3">
                  {deliveryAnalytics?.topPerformingRiders?.slice(0, 5).map((rider, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{rider.name}</div>
                        <div className="text-sm text-gray-600">{rider.deliveries} deliveries</div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{rider.rating}</span>
                      </div>
                    </div>
                  )) || [
                    { name: 'Mike Chen', deliveries: 120, rating: 4.8 },
                    { name: 'James Wilson', deliveries: 95, rating: 4.6 },
                    { name: 'David Lee', deliveries: 87, rating: 4.7 },
                    { name: 'Alex Rodriguez', deliveries: 76, rating: 4.5 },
                    { name: 'Tom Anderson', deliveries: 68, rating: 4.4 },
                  ].map((rider, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{rider.name}</div>
                        <div className="text-sm text-gray-600">{rider.deliveries} deliveries</div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{rider.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;
