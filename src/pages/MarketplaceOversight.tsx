import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, message, Tabs, Image, Descriptions } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  StopOutlined,
  ShoppingCartOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchProducts, 
  fetchTransactions, 
  fetchPendingApprovals,
  approveProduct,
  rejectProduct,
  suspendProduct,
  setSelectedProduct,
  setSelectedTransaction
} from '../store/slices/marketplaceSlice';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const MarketplaceOversight: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, transactions, pendingApprovals, loading, selectedProduct, selectedTransaction } = useAppSelector((state) => state.marketplace);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productDetailModal, setProductDetailModal] = useState(false);
  const [transactionDetailModal, setTransactionDetailModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchTransactions({}));
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = { search: value, status: statusFilter !== 'all' ? statusFilter : undefined };
    
    if (activeTab === 'products') {
      dispatch(fetchProducts(params));
    } else if (activeTab === 'transactions') {
      dispatch(fetchTransactions(params));
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const params = { search: searchTerm || undefined, status: status !== 'all' ? status : undefined };
    
    if (activeTab === 'products') {
      dispatch(fetchProducts(params));
    } else if (activeTab === 'transactions') {
      dispatch(fetchTransactions(params));
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      await dispatch(approveProduct(productId)).unwrap();
      message.success('Product approved successfully');
    } catch (error) {
      message.error('Failed to approve product');
    }
  };

  const handleRejectProduct = async (values: { reason: string }) => {
    if (!selectedProduct) return;
    
    try {
      await dispatch(rejectProduct({ productId: selectedProduct.id, reason: values.reason })).unwrap();
      message.success('Product rejected successfully');
      setRejectModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to reject product');
    }
  };

  const handleSuspendProduct = async (values: { reason: string }) => {
    if (!selectedProduct) return;
    
    try {
      await dispatch(suspendProduct({ productId: selectedProduct.id, reason: values.reason })).unwrap();
      message.success('Product suspended successfully');
      setSuspendModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to suspend product');
    }
  };

  const showProductDetails = (product: any) => {
    dispatch(setSelectedProduct(product));
    setProductDetailModal(true);
  };

  const showTransactionDetails = (transaction: any) => {
    dispatch(setSelectedTransaction(transaction));
    setTransactionDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'confirmed': case 'delivered': return 'green';
      case 'pending': case 'shipped': return 'blue';
      case 'rejected': case 'cancelled': return 'red';
      case 'suspended': case 'disputed': return 'orange';
      default: return 'gray';
    }
  };

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <div className="flex items-center">
          <Image
            width={50}
            height={50}
            src={record.images?.[0]}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            className="mr-3 rounded"
          />
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-gray-500 text-sm">{record.sellerName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
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
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showProductDetails(record)} />
          {record.status === 'pending' && (
            <>
              <Button 
                icon={<CheckCircleOutlined />} 
                type="primary"
                onClick={() => handleApproveProduct(record.id)}
              />
              <Button 
                icon={<CloseCircleOutlined />} 
                danger
                onClick={() => {
                  dispatch(setSelectedProduct(record));
                  setRejectModal(true);
                }}
              />
            </>
          )}
          {record.status === 'approved' && (
            <Button 
              icon={<StopOutlined />} 
              onClick={() => {
                dispatch(setSelectedProduct(record));
                setSuspendModal(true);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => `#${id.slice(-8)}`,
    },
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      render: (productId: string) => `Product #${productId.slice(-8)}`,
    },
    {
      title: 'Buyer',
      dataIndex: 'buyerId',
      key: 'buyerId',
      render: (buyerId: string) => `User #${buyerId.slice(-8)}`,
    },
    {
      title: 'Seller',
      dataIndex: 'sellerId',
      key: 'sellerId',
      render: (sellerId: string) => `User #${sellerId.slice(-8)}`,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
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
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showTransactionDetails(record)} />
        </Space>
      ),
    },
  ];

  const pendingColumns = [
    {
      title: 'Product',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <div className="flex items-center">
          <Image
            width={40}
            height={40}
            src={record.images?.[0]}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            className="mr-2 rounded"
          />
          <div>
            <div className="font-medium text-sm">{title}</div>
            <div className="text-gray-500 text-xs">{record.sellerName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            size="small"
            icon={<CheckCircleOutlined />} 
            type="primary"
            onClick={() => handleApproveProduct(record.id)}
          />
          <Button 
            size="small"
            icon={<CloseCircleOutlined />} 
            danger
            onClick={() => {
              dispatch(setSelectedProduct(record));
              setRejectModal(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Oversight</h1>
        <p className="text-gray-600">Manage products, transactions, and marketplace operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <ShoppingCartOutlined className="text-2xl text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-gray-600">Total Products</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <CheckCircleOutlined className="text-2xl text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{pendingApprovals.length}</div>
              <div className="text-gray-600">Pending Approvals</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <DollarOutlined className="text-2xl text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <div className="text-gray-600">Transactions</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <StopOutlined className="text-2xl text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {transactions.filter(t => t.status === 'disputed').length}
              </div>
              <div className="text-gray-600">Disputed Orders</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card title="Pending Approvals" size="small">
            <Table
              columns={pendingColumns}
              dataSource={pendingApprovals.slice(0, 5)}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="mb-4 flex justify-between items-center">
              <Space>
                <Search
                  placeholder="Search products/transactions..."
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
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="suspended">Suspended</Option>
                </Select>
              </Space>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab={`Products (${products.length})`} key="products">
                <Table
                  columns={productColumns}
                  dataSource={products}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              </TabPane>
              
              <TabPane tab={`Transactions (${transactions.length})`} key="transactions">
                <Table
                  columns={transactionColumns}
                  dataSource={transactions}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Product Details Modal */}
      <Modal
        title="Product Details"
        open={productDetailModal}
        onCancel={() => setProductDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Image.PreviewGroup>
                  {selectedProduct.images?.map((img: string, index: number) => (
                    <Image key={index} width={100} height={100} src={img} className="mr-2" />
                  ))}
                </Image.PreviewGroup>
              </div>
              <div>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Title">{selectedProduct.title}</Descriptions.Item>
                  <Descriptions.Item label="Price">${selectedProduct.price}</Descriptions.Item>
                  <Descriptions.Item label="Category">{selectedProduct.category}</Descriptions.Item>
                  <Descriptions.Item label="Stock">{selectedProduct.stock}</Descriptions.Item>
                  <Descriptions.Item label="Condition">{selectedProduct.condition}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedProduct.status)}>
                      {selectedProduct.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p>{selectedProduct.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        title="Transaction Details"
        open={transactionDetailModal}
        onCancel={() => setTransactionDetailModal(false)}
        footer={null}
        width={600}
      >
        {selectedTransaction && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Transaction ID">#{selectedTransaction.id}</Descriptions.Item>
            <Descriptions.Item label="Amount">${selectedTransaction.amount}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedTransaction.status)}>
                {selectedTransaction.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">{selectedTransaction.paymentMethod}</Descriptions.Item>
            <Descriptions.Item label="Delivery Address" span={2}>
              {selectedTransaction.deliveryAddress}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Reject Product Modal */}
      <Modal
        title="Reject Product"
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleRejectProduct} layout="vertical">
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
          >
            <TextArea rows={4} placeholder="Enter reason for rejecting this product..." />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button type="primary" danger htmlType="submit">
              Reject Product
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Suspend Product Modal */}
      <Modal
        title="Suspend Product"
        open={suspendModal}
        onCancel={() => setSuspendModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSuspendProduct} layout="vertical">
          <Form.Item
            name="reason"
            label="Suspension Reason"
            rules={[{ required: true, message: 'Please provide a reason for suspension' }]}
          >
            <TextArea rows={4} placeholder="Enter reason for suspending this product..." />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setSuspendModal(false)}>Cancel</Button>
            <Button type="primary" danger htmlType="submit">
              Suspend Product
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MarketplaceOversight;
