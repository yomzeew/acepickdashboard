import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, message, Tabs, Rate, Image, Descriptions } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  StopOutlined,
  ToolOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchServices, 
  fetchServiceRequests, 
  updateServiceStatus,
  resolveServiceDispute,
  setSelectedService,
  setSelectedRequest
} from '../store/slices/serviceSlice';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ServiceManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { services, serviceRequests, loading, selectedService, selectedRequest } = useAppSelector((state) => state.services);
  const [activeTab, setActiveTab] = useState('services');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceDetailModal, setServiceDetailModal] = useState(false);
  const [requestDetailModal, setRequestDetailModal] = useState(false);
  const [disputeModal, setDisputeModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchServices({}));
    dispatch(fetchServiceRequests({}));
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = { search: value, status: statusFilter !== 'all' ? statusFilter : undefined };
    
    if (activeTab === 'services') {
      dispatch(fetchServices(params));
    } else if (activeTab === 'requests') {
      dispatch(fetchServiceRequests(params));
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const params = { search: searchTerm || undefined, status: status !== 'all' ? status : undefined };
    
    if (activeTab === 'services') {
      dispatch(fetchServices(params));
    } else if (activeTab === 'requests') {
      dispatch(fetchServiceRequests(params));
    }
  };

  const handleUpdateServiceStatus = async (serviceId: string, status: string) => {
    try {
      await dispatch(updateServiceStatus({ serviceId, status })).unwrap();
      message.success(`Service status updated to ${status}`);
    } catch (error) {
      message.error('Failed to update service status');
    }
  };

  const handleResolveDispute = async (values: { resolution: string; refundAmount?: number }) => {
    if (!selectedRequest) return;
    
    try {
      await dispatch(resolveServiceDispute({ 
        requestId: selectedRequest.id, 
        resolution: values.resolution,
        refundAmount: values.refundAmount 
      })).unwrap();
      message.success('Dispute resolved successfully');
      setDisputeModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to resolve dispute');
    }
  };

  const showServiceDetails = (service: any) => {
    dispatch(setSelectedService(service));
    setServiceDetailModal(true);
  };

  const showRequestDetails = (request: any) => {
    dispatch(setSelectedRequest(request));
    setRequestDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': case 'accepted': return 'green';
      case 'pending': case 'in_progress': return 'blue';
      case 'cancelled': case 'inactive': return 'red';
      case 'suspended': case 'disputed': return 'orange';
      default: return 'gray';
    }
  };

  const serviceColumns = [
    {
      title: 'Service',
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
            <div className="text-gray-500 text-sm">{record.professionalName}</div>
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
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} min`,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} className="text-sm" />,
    },
    {
      title: 'Bookings',
      dataIndex: 'totalBookings',
      key: 'totalBookings',
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
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showServiceDetails(record)} />
          <Select
            defaultValue={record.status}
            onChange={(status) => handleUpdateServiceStatus(record.id, status)}
            style={{ width: 120 }}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="suspended">Suspend</Option>
          </Select>
        </Space>
      ),
    },
  ];

  const requestColumns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => `#${id.slice(-8)}`,
    },
    {
      title: 'Service',
      dataIndex: 'serviceTitle',
      key: 'serviceTitle',
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Professional',
      dataIndex: 'professionalName',
      key: 'professionalName',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Scheduled',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'green' : status === 'refunded' ? 'orange' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showRequestDetails(record)} />
          {record.status === 'disputed' && (
            <Button 
              type="primary"
              onClick={() => {
                dispatch(setSelectedRequest(record));
                setDisputeModal(true);
              }}
            >
              Resolve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <p className="text-gray-600">Oversee services and service requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <ToolOutlined className="text-2xl text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{services.length}</div>
              <div className="text-gray-600">Total Services</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <ClockCircleOutlined className="text-2xl text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {serviceRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-gray-600">Pending Requests</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <CheckCircleOutlined className="text-2xl text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {serviceRequests.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-gray-600">Completed</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <CloseCircleOutlined className="text-2xl text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {serviceRequests.filter(r => r.status === 'disputed').length}
              </div>
              <div className="text-gray-600">Disputes</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Search
              placeholder="Search services/requests..."
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
              <Option value="active">Active</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="disputed">Disputed</Option>
            </Select>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Services (${services.length})`} key="services">
            <Table
              columns={serviceColumns}
              dataSource={services}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </TabPane>
          
          <TabPane tab={`Service Requests (${serviceRequests.length})`} key="requests">
            <Table
              columns={requestColumns}
              dataSource={serviceRequests}
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

      {/* Service Details Modal */}
      <Modal
        title="Service Details"
        open={serviceDetailModal}
        onCancel={() => setServiceDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Image.PreviewGroup>
                  {selectedService.images?.map((img: string, index: number) => (
                    <Image key={index} width={100} height={100} src={img} className="mr-2" />
                  ))}
                </Image.PreviewGroup>
              </div>
              <div>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Title">{selectedService.title}</Descriptions.Item>
                  <Descriptions.Item label="Professional">{selectedService.professionalName}</Descriptions.Item>
                  <Descriptions.Item label="Price">${selectedService.price}</Descriptions.Item>
                  <Descriptions.Item label="Duration">{selectedService.duration} minutes</Descriptions.Item>
                  <Descriptions.Item label="Category">{selectedService.category}</Descriptions.Item>
                  <Descriptions.Item label="Rating">
                    <Rate disabled defaultValue={selectedService.rating} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Bookings">{selectedService.totalBookings}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedService.status)}>
                      {selectedService.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p>{selectedService.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Service Request Details Modal */}
      <Modal
        title="Service Request Details"
        open={requestDetailModal}
        onCancel={() => setRequestDetailModal(false)}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Request ID">#{selectedRequest.id}</Descriptions.Item>
              <Descriptions.Item label="Service">{selectedRequest.serviceTitle}</Descriptions.Item>
              <Descriptions.Item label="Client">{selectedRequest.clientName}</Descriptions.Item>
              <Descriptions.Item label="Professional">{selectedRequest.professionalName}</Descriptions.Item>
              <Descriptions.Item label="Amount">${selectedRequest.amount}</Descriptions.Item>
              <Descriptions.Item label="Scheduled Date">
                {new Date(selectedRequest.scheduledDate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={selectedRequest.paymentStatus === 'paid' ? 'green' : 'blue'}>
                  {selectedRequest.paymentStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {selectedRequest.completedAt && (
                <Descriptions.Item label="Completed At" span={2}>
                  {new Date(selectedRequest.completedAt).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedRequest.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedRequest.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Dispute Resolution Modal */}
      <Modal
        title="Resolve Service Dispute"
        open={disputeModal}
        onCancel={() => setDisputeModal(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleResolveDispute} layout="vertical">
          <Form.Item
            name="resolution"
            label="Resolution Details"
            rules={[{ required: true, message: 'Please provide resolution details' }]}
          >
            <TextArea rows={4} placeholder="Describe the resolution..." />
          </Form.Item>
          <Form.Item
            name="refundAmount"
            label="Refund Amount (Optional)"
          >
            <Input type="number" prefix="$" placeholder="0.00" />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setDisputeModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Resolve Dispute
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceManagement;
