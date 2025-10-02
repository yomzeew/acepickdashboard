import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Statistic, 
  Tabs, 
  Tag, 
  Space,
  Tooltip,
  Progress,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  CheckOutlined, 
  CloseOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchAccountsPayable,
  fetchAccountsReceivable,
  fetchFinancialTransactions,
  fetchFinancialSummary,
  createPayable,
  createReceivable,
  markReceivableAsPaid,
  markPayableAsPaid
} from '../store/slices/financeSlice';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface PaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  type: 'payable' | 'receivable';
  editingRecord?: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onCancel, onSubmit, type, editingRecord }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue(editingRecord);
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={`${editingRecord ? 'Edit' : 'Add'} ${type === 'payable' ? 'Payable' : 'Receivable'} Entry`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="vendor"
              label={type === 'payable' ? 'Vendor/Supplier' : 'Customer/Client'}
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <Input placeholder={`Enter ${type === 'payable' ? 'vendor' : 'customer'} name`} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Amount is required' }]}
            >
              <Input prefix="$" type="number" placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: 'Due date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select placeholder="Select category">
                {type === 'payable' ? (
                  <>
                    <Option value="operational">Operational Expenses</Option>
                    <Option value="marketing">Marketing</Option>
                    <Option value="technology">Technology</Option>
                    <Option value="legal">Legal & Compliance</Option>
                    <Option value="utilities">Utilities</Option>
                    <Option value="rent">Rent & Facilities</Option>
                  </>
                ) : (
                  <>
                    <Option value="commission">Commission</Option>
                    <Option value="service_fee">Service Fee</Option>
                    <Option value="delivery_fee">Delivery Fee</Option>
                    <Option value="subscription">Subscription</Option>
                    <Option value="penalty">Penalty</Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Priority is required' }]}
            >
              <Select placeholder="Select priority">
                <Option value="high">High</Option>
                <Option value="medium">Medium</Option>
                <Option value="low">Low</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select placeholder="Select status">
                <Option value="pending">Pending</Option>
                <Option value="processing">Processing</Option>
                <Option value="paid">Paid</Option>
                <Option value="overdue">Overdue</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={3} placeholder="Enter description or notes" />
        </Form.Item>

        <Form.Item
          name="invoiceNumber"
          label="Invoice/Reference Number"
        >
          <Input placeholder="Enter invoice or reference number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const FinanceManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    accountsPayable, 
    accountsReceivable, 
    transactions, 
    financialSummary, 
    loading 
  } = useAppSelector((state) => state.finance);

  const [activeTab, setActiveTab] = useState('summary');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState<'payable' | 'receivable'>('payable');
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    dispatch(fetchAccountsPayable({}));
    dispatch(fetchAccountsReceivable({}));
    dispatch(fetchFinancialTransactions({}));
    dispatch(fetchFinancialSummary());
  }, [dispatch]);

  const handleAddPayment = (type: 'payable' | 'receivable') => {
    setPaymentModalType(type);
    setEditingRecord(null);
    setPaymentModalVisible(true);
  };

  const handleEditPayment = (record: any, type: 'payable' | 'receivable') => {
    setPaymentModalType(type);
    setEditingRecord(record);
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = (values: any) => {
    if (paymentModalType === 'payable') {
      dispatch(createPayable(values));
    } else {
      dispatch(createReceivable(values));
    }
    setPaymentModalVisible(false);
    message.success(`${paymentModalType === 'payable' ? 'Payable' : 'Receivable'} entry ${editingRecord ? 'updated' : 'created'} successfully`);
  };

  const handleMarkPaid = (id: string, type: 'payable' | 'receivable') => {
    if (type === 'payable') {
      dispatch(markPayableAsPaid({ payableId: id, paymentDetails: {} }));
    } else {
      dispatch(markReceivableAsPaid({ receivableId: id, paymentDetails: {} }));
    }
    message.success('Payment status updated successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'overdue': return 'red';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const payableColumns = [
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditPayment(record, 'payable')}
            />
          </Tooltip>
          {record.status !== 'paid' && (
            <Tooltip title="Mark as Paid">
              <Button 
                icon={<CheckOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleMarkPaid(record.id, 'payable')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const receivableColumns = [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₦${amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="green">{category.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditPayment(record, 'receivable')}
            />
          </Tooltip>
          {record.status !== 'paid' && (
            <Tooltip title="Mark as Received">
              <Button 
                icon={<CheckOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleMarkPaid(record.id, 'receivable')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
          {record.type === 'income' ? '+' : '-'}₦{Math.abs(amount).toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      ),
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag>{category.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('NGN', '₦');
  };

  // Mock data for demonstration
  const mockPayableData = [
    {
      id: '1',
      vendor: 'AWS Services',
      amount: 2500,
      dueDate: '2024-01-15',
      category: 'technology',
      priority: 'high',
      status: 'pending',
      description: 'Monthly cloud hosting services'
    },
    {
      id: '2',
      vendor: 'Marketing Agency',
      amount: 5000,
      dueDate: '2024-01-20',
      category: 'marketing',
      priority: 'medium',
      status: 'processing',
      description: 'Q1 marketing campaign'
    },
  ];

  const mockReceivableData = [
    {
      id: '1',
      customer: 'Premium Client Corp',
      amount: 15000,
      dueDate: '2024-01-10',
      category: 'commission',
      priority: 'high',
      status: 'overdue',
      description: 'Monthly commission payment'
    },
    {
      id: '2',
      customer: 'Service Provider LLC',
      amount: 3500,
      dueDate: '2024-01-25',
      category: 'service_fee',
      priority: 'medium',
      status: 'pending',
      description: 'Platform service fees'
    },
  ];

  const mockTransactionData = [
    {
      id: '1',
      date: '2024-01-05',
      type: 'income',
      description: 'Commission from services',
      amount: 12500,
      category: 'commission',
      reference: 'TXN-001'
    },
    {
      id: '2',
      date: '2024-01-03',
      type: 'expense',
      description: 'Marketing campaign payment',
      amount: -3000,
      category: 'marketing',
      reference: 'TXN-002'
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600">Manage accounts payable, receivable, and financial reports</p>
        </div>
        <Space>
          <Button icon={<FileExcelOutlined />}>Export Excel</Button>
          <Button icon={<FilePdfOutlined />}>Export PDF</Button>
          <RangePicker />
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Financial Summary" key="summary">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={financialSummary?.totalRevenue || 0}
                  precision={2}
                  suffix=" this month"
              formatter={(value) => new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(Number(value)).replace('NGN', '₦')}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Expenses"
                  value={financialSummary?.totalExpenses || 0}
                  precision={2}
                  suffix=" this month"
                  formatter={(value) => new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(Number(value)).replace('NGN', '₦')}
                  
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Net Profit"
                  value={financialSummary?.netProfit || 222222}
                  prefix={'₦'}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Profit Margin"
                  value={financialSummary?.profitMargin || 48.6}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Outstanding Receivables"
                  value={89500}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Outstanding Payables"
                  value={45200}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Cash Flow"
                  value={44300}
                  prefix={'₦'}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Collection Rate"
                  value={92.5}
                  suffix="%"
                  precision={1}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Payment Status Overview">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Paid on Time</span>
                      <span>78%</span>
                    </div>
                    <Progress percent={78} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Pending Payments</span>
                      <span>15%</span>
                    </div>
                    <Progress percent={15} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Overdue Payments</span>
                      <span>7%</span>
                    </div>
                    <Progress percent={7} strokeColor="#ff4d4f" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top Expense Categories">
                <div className="space-y-3">
                  {[
                    { category: 'Technology', amount: 45000, percentage: 35 },
                    { category: 'Marketing', amount: 32000, percentage: 25 },
                    { category: 'Operations', amount: 25000, percentage: 20 },
                    { category: 'Legal & Compliance', amount: 15000, percentage: 12 },
                    { category: 'Utilities', amount: 10000, percentage: 8 },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.category}</div>
                        <div className="text-sm text-gray-600">${item.amount.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress percent={item.percentage} strokeColor="#1890ff" className="w-20" />
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Accounts Payable" key="payable">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Accounts Payable</h3>
              <p className="text-gray-600">Manage vendor payments and expenses</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => handleAddPayment('payable')}
            >
              Add Payable Entry
            </Button>
          </div>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Payables"
                  value={financialSummary?.totalPayables || 125000}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Overdue Amount"
                  value={15000}
                  prefix={'₦'}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Due This Week"
                  value={35000}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <Table
              columns={payableColumns}
              dataSource={accountsPayable || mockPayableData}
              loading={loading}
              rowKey="id"
              pagination={{
                total: accountsPayable?.length || mockPayableData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Accounts Receivable" key="receivable">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Accounts Receivable</h3>
              <p className="text-gray-600">Track customer payments and revenue</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => handleAddPayment('receivable')}
            >
              Add Receivable Entry
            </Button>
          </div>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Receivables"
                  value={financialSummary?.totalReceivables || accountsReceivable?.reduce((sum, item) => sum + item.amount, 0) || 89500}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Overdue Amount"
                  value={25000}
                  prefix={'₦'}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Expected This Week"
                  value={42000}
                  prefix={'₦'}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <Table
              columns={receivableColumns}
              dataSource={accountsReceivable || mockReceivableData}
              loading={loading}
              rowKey="id"
              pagination={{
                total: accountsReceivable?.length || mockReceivableData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Transaction History" key="transactions">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Financial Transactions</h3>
            <p className="text-gray-600">Complete history of all financial transactions</p>
          </div>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Transactions"
                  value={transactions?.length || 1247}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="This Month Income"
                  value={125000}
                  prefix={'₦'}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="This Month Expenses"
                  value={67000}
                  prefix={'₦'}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <div className="mb-4 flex justify-between items-center">
              <Space>
                <Select defaultValue="all" style={{ width: 120 }}>
                  <Option value="all">All Types</Option>
                  <Option value="income">Income</Option>
                  <Option value="expense">Expense</Option>
                </Select>
                <Select defaultValue="all" style={{ width: 150 }}>
                  <Option value="all">All Categories</Option>
                  <Option value="commission">Commission</Option>
                  <Option value="marketing">Marketing</Option>
                  <Option value="technology">Technology</Option>
                </Select>
                <RangePicker />
              </Space>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </div>
            
            <Table
              columns={transactionColumns}
              dataSource={transactions || mockTransactionData}
              loading={loading}
              rowKey="id"
              pagination={{
                total: transactions?.length || mockTransactionData.length,
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <PaymentModal
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onSubmit={handlePaymentSubmit}
        type={paymentModalType}
        editingRecord={editingRecord}
      />
    </div>
  );
};

export default FinanceManagement;
