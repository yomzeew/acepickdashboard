import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, message, Tabs, Avatar, Progress } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  UserOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchDeliveryRequests, 
  fetchAvailableRiders, 
  fetchUnassignedDeliveries,
  assignRiderToDelivery,
  updateDeliveryStatus,
  setSelectedDelivery
} from '../store/slices/deliverySlice';
import type { DeliveryRequest } from '../store/slices/deliverySlice';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const DeliveryManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { deliveryRequests, availableRiders, unassignedDeliveries, loading, selectedDelivery } = useAppSelector((state) => state.delivery);
  const [activeTab, setActiveTab] = useState('deliveries');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryDetailModal, setDeliveryDetailModal] = useState(false);
  const [assignRiderModal, setAssignRiderModal] = useState(false);
  const [updateStatusModal, setUpdateStatusModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchDeliveryRequests({}));
    dispatch(fetchAvailableRiders());
    dispatch(fetchUnassignedDeliveries());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = { search: value, status: statusFilter !== 'all' ? statusFilter : undefined };
    dispatch(fetchDeliveryRequests(params));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const params = { search: searchTerm || undefined, status: status !== 'all' ? status : undefined };
    dispatch(fetchDeliveryRequests(params));
  };

  const handleAssignRider = async (values: { riderId: string }) => {
    if (!selectedDelivery) return;
    
    try {
      await dispatch(assignRiderToDelivery({ 
        deliveryId: selectedDelivery.id, 
        riderId: values.riderId 
      })).unwrap();
      message.success('Rider assigned successfully');
      setAssignRiderModal(false);
      form.resetFields();
      dispatch(fetchUnassignedDeliveries());
    } catch (error) {
      message.error('Failed to assign rider');
    }
  };

  const handleUpdateStatus = async (values: { status: string; notes?: string }) => {
    if (!selectedDelivery) return;
    
    try {
      await dispatch(updateDeliveryStatus({ 
        deliveryId: selectedDelivery.id, 
        status: values.status,
        notes: values.notes
      })).unwrap();
      message.success('Delivery status updated successfully');
      setUpdateStatusModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update delivery status');
    }
  };

  const showDeliveryDetails = (delivery: any) => {
    dispatch(setSelectedDelivery(delivery));
    setDeliveryDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'in_transit': case 'picked_up': return 'blue';
      case 'assigned': return 'cyan';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'assigned': return 40;
      case 'picked_up': return 60;
      case 'in_transit': return 80;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const deliveryColumns = [
    {
      title: 'Tracking #',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (trackingNumber: string) => `#${trackingNumber}`,
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Seller',
      dataIndex: 'sellerName',
      key: 'sellerName',
    },
    {
      title: 'Rider',
      dataIndex: 'riderName',
      key: 'riderName',
      render: (riderName: string) => riderName || 'Unassigned',
    },
    {
      title: 'Pickup Address',
      dataIndex: 'pickupAddress',
      key: 'pickupAddress',
      ellipsis: true,
    },
    {
      title: 'Delivery Address',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      ellipsis: true,
    },
    {
      title: 'Fee',
      dataIndex: 'deliveryFee',
      key: 'deliveryFee',
      render: (fee: number) => `$${fee.toFixed(2)}`,
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance: number) => `${distance.toFixed(1)} km`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <div>
          <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
          <Progress 
            percent={getStatusProgress(status)} 
            size="small" 
            showInfo={false}
            strokeColor={getStatusColor(status)}
          />
        </div>
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
      render: (_: any, record: DeliveryRequest) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDeliveryDetails(record)} />
          {record.status === 'pending' && (
            <Button 
              type="primary"
              onClick={() => {
                dispatch(setSelectedDelivery(record));
                setAssignRiderModal(true);
              }}
            >
              Assign Rider
            </Button>
          )}
          {record.status !== 'delivered' && record.status !== 'cancelled' && (
            <Button 
              onClick={() => {
                dispatch(setSelectedDelivery(record));
                setUpdateStatusModal(true);
              }}
            >
              Update Status
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const riderColumns = [
    {
      title: 'Rider',
      dataIndex: 'riderName',
      key: 'riderName',
      render: (name: string) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-2" />
          {name}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'green' : 'red'}>
          {isAvailable ? 'Available' : 'Busy'}
        </Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'latitude',
      key: 'location',
      render: (lat: number, record: any) => (
        <div className="flex items-center">
          <EnvironmentOutlined className="mr-1" />
          {lat.toFixed(4)}, {record.longitude.toFixed(4)}
        </div>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const unassignedColumns = [
    {
      title: 'Tracking #',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (trackingNumber: string) => `#${trackingNumber}`,
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Pickup',
      dataIndex: 'pickupAddress',
      key: 'pickupAddress',
      ellipsis: true,
    },
    {
      title: 'Delivery',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      ellipsis: true,
    },
    {
      title: 'Fee',
      dataIndex: 'deliveryFee',
      key: 'deliveryFee',
      render: (fee: number) => `$${fee.toFixed(2)}`,
    },
    {
      title: 'Time Waiting',
      dataIndex: 'createdAt',
      key: 'timeWaiting',
      render: (createdAt: string) => {
        const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
        return (
          <div className={hours > 1 ? 'text-red-500 font-medium' : ''}>
            {hours}h {Math.floor(((Date.now() - new Date(createdAt).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DeliveryRequest) => (
        <Button 
          type="primary"
          onClick={() => {
            dispatch(setSelectedDelivery(record));
            setAssignRiderModal(true);
          }}
        >
          Assign Rider
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
        <p className="text-gray-600">Track deliveries and manage rider assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <TruckOutlined className="text-2xl text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{deliveryRequests.length}</div>
              <div className="text-gray-600">Total Deliveries</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <ClockCircleOutlined className="text-2xl text-orange-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{unassignedDeliveries.length}</div>
              <div className="text-gray-600">Unassigned</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <UserOutlined className="text-2xl text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {availableRiders.filter(r => r.isAvailable).length}
              </div>
              <div className="text-gray-600">Available Riders</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <CheckCircleOutlined className="text-2xl text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {deliveryRequests.filter(d => d.status === 'delivered').length}
              </div>
              <div className="text-gray-600">Completed Today</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Search
              placeholder="Search deliveries..."
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
              <Option value="assigned">Assigned</Option>
              <Option value="picked_up">Picked Up</Option>
              <Option value="in_transit">In Transit</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`All Deliveries (${deliveryRequests.length})`} key="deliveries">
            <Table
              columns={deliveryColumns}
              dataSource={deliveryRequests}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                Unassigned ({unassignedDeliveries.length})
                {unassignedDeliveries.length > 0 && (
                  <ExclamationCircleOutlined className="ml-1 text-red-500" />
                )}
              </span>
            } 
            key="unassigned"
          >
            <Table
              columns={unassignedColumns}
              dataSource={unassignedDeliveries}
              loading={loading}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane tab={`Available Riders (${availableRiders.length})`} key="riders">
            <Table
              columns={riderColumns}
              dataSource={availableRiders}
              loading={loading}
              rowKey="riderId"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Delivery Details Modal */}
      <Modal
        title="Delivery Details"
        open={deliveryDetailModal}
        onCancel={() => setDeliveryDetailModal(false)}
        footer={null}
        width={700}
      >
        {selectedDelivery && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Tracking Information</h4>
                <p><strong>Tracking #:</strong> #{selectedDelivery.trackingNumber}</p>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedDelivery.status)} className="ml-2">
                    {selectedDelivery.status.toUpperCase()}
                  </Tag>
                </p>
                <p><strong>Distance:</strong> {selectedDelivery.distance?.toFixed(1)} km</p>
                <p><strong>Delivery Fee:</strong> ${selectedDelivery.deliveryFee?.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Participants</h4>
                <p><strong>Client:</strong> {selectedDelivery.clientName}</p>
                <p><strong>Seller:</strong> {selectedDelivery.sellerName}</p>
                <p><strong>Rider:</strong> {selectedDelivery.riderName || 'Unassigned'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Addresses</h4>
              <p><strong>Pickup:</strong> {selectedDelivery.pickupAddress}</p>
              <p><strong>Delivery:</strong> {selectedDelivery.deliveryAddress}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Timeline</h4>
              <p><strong>Created:</strong> {new Date(selectedDelivery.createdAt).toLocaleString()}</p>
              {selectedDelivery.assignedAt && (
                <p><strong>Assigned:</strong> {new Date(selectedDelivery.assignedAt).toLocaleString()}</p>
              )}
              <p><strong>Estimated Delivery:</strong> {new Date(selectedDelivery.estimatedDelivery).toLocaleString()}</p>
              {selectedDelivery.actualDelivery && (
                <p><strong>Actual Delivery:</strong> {new Date(selectedDelivery.actualDelivery).toLocaleString()}</p>
              )}
            </div>

            <div className="mt-4">
              <Progress 
                percent={getStatusProgress(selectedDelivery.status)} 
                strokeColor={getStatusColor(selectedDelivery.status)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Rider Modal */}
      <Modal
        title="Assign Rider to Delivery"
        open={assignRiderModal}
        onCancel={() => setAssignRiderModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAssignRider} layout="vertical">
          <Form.Item
            name="riderId"
            label="Select Rider"
            rules={[{ required: true, message: 'Please select a rider' }]}
          >
            <Select placeholder="Choose an available rider">
              {availableRiders.filter(r => r.isAvailable).map(rider => (
                <Option key={rider.riderId} value={rider.riderId}>
                  <div className="flex items-center justify-between">
                    <span>{rider.riderName}</span>
                    <span className="text-gray-500 text-sm">
                      {rider.latitude.toFixed(2)}, {rider.longitude.toFixed(2)}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setAssignRiderModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Assign Rider
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Delivery Status"
        open={updateStatusModal}
        onCancel={() => setUpdateStatusModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateStatus} layout="vertical">
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select new status">
              <Option value="assigned">Assigned</Option>
              <Option value="picked_up">Picked Up</Option>
              <Option value="in_transit">In Transit</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label="Notes (Optional)"
          >
            <TextArea rows={3} placeholder="Add any additional notes..." />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setUpdateStatusModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Update Status
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DeliveryManagement;
