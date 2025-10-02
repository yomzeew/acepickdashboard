import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, message, Tabs, Upload, Image, Descriptions } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  FileOutlined,
  UploadOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchDisputes, 
  fetchDisputeById,
  updateDisputeStatus,
  resolveDispute,
  addDisputeEvidence,
  assignDisputeToAdmin,
  setSelectedDispute,
  setFilters,
  clearFilters
} from '../store/slices/disputeSlice';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const DisputeManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { disputes, selectedDispute, loading, filters } = useAppSelector((state) => state.disputes);
  const [searchTerm, setSearchTerm] = useState('');
  const [disputeDetailModal, setDisputeDetailModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchDisputes({}));
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(fetchDisputes({ search: value, ...filters }));
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    dispatch(setFilters(newFilters));
    dispatch(fetchDisputes({ search: searchTerm, ...newFilters }));
  };

  const handleUpdateStatus = async (disputeId: string, status: string) => {
    try {
      await dispatch(updateDisputeStatus({ disputeId, status })).unwrap();
      message.success(`Dispute status updated to ${status}`);
    } catch (error) {
      message.error('Failed to update dispute status');
    }
  };

  const handleResolveDispute = async (values: { resolution: string; refundAmount?: number; adminNotes?: string }) => {
    if (!selectedDispute) return;
    
    try {
      await dispatch(resolveDispute({ 
        disputeId: selectedDispute.id, 
        resolution: values.resolution,
        refundAmount: values.refundAmount,
        adminNotes: values.adminNotes
      })).unwrap();
      message.success('Dispute resolved successfully');
      setResolveModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to resolve dispute');
    }
  };

  const handleAddEvidence = async (values: { type: string; description?: string; file: any }) => {
    if (!selectedDispute || !values.file) return;
    
    try {
      await dispatch(addDisputeEvidence({ 
        disputeId: selectedDispute.id, 
        evidence: {
          type: values.type,
          file: values.file.file,
          description: values.description
        }
      })).unwrap();
      message.success('Evidence added successfully');
      setEvidenceModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to add evidence');
    }
  };

  const handleAssignDispute = async (values: { adminId: string }) => {
    if (!selectedDispute) return;
    
    try {
      await dispatch(assignDisputeToAdmin({ 
        disputeId: selectedDispute.id, 
        adminId: values.adminId 
      })).unwrap();
      message.success('Dispute assigned successfully');
      setAssignModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to assign dispute');
    }
  };

  const showDisputeDetails = async (dispute: any) => {
    dispatch(setSelectedDispute(dispute));
    await dispatch(fetchDisputeById(dispute.id));
    setDisputeDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'green';
      case 'investigating': return 'blue';
      case 'open': return 'orange';
      case 'closed': return 'gray';
      default: return 'red';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return '🔧';
      case 'marketplace': return '🛒';
      case 'delivery': return '🚚';
      default: return '❓';
    }
  };

  const disputeColumns = [
    {
      title: 'Dispute ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => `#${id.slice(-8)}`,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <div className="flex items-center">
          <span className="mr-2">{getTypeIcon(type)}</span>
          <Tag color="blue">{type.toUpperCase()}</Tag>
        </div>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Complainant',
      dataIndex: 'complainantName',
      key: 'complainantName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
          <Tag color="blue">{record.complainantType}</Tag>
        </div>
      ),
    },
    {
      title: 'Respondent',
      dataIndex: 'respondentName',
      key: 'respondentName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
          <Tag color="green">{record.respondentType}</Tag>
        </div>
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
          <Button icon={<EyeOutlined />} onClick={() => showDisputeDetails(record)} />
          {record.status === 'open' && (
            <Button 
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'investigating')}
            >
              Investigate
            </Button>
          )}
          {record.status === 'investigating' && (
            <Button 
              type="primary"
              onClick={() => {
                dispatch(setSelectedDispute(record));
                setResolveModal(true);
              }}
            >
              Resolve
            </Button>
          )}
          {!record.assignedAdminId && (
            <Button 
              onClick={() => {
                dispatch(setSelectedDispute(record));
                setAssignModal(true);
              }}
            >
              Assign
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-600">Handle conflicts and resolve disputes between users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-2xl text-orange-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {disputes.filter(d => d.status === 'open').length}
              </div>
              <div className="text-gray-600">Open Disputes</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <ClockCircleOutlined className="text-2xl text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {disputes.filter(d => d.status === 'investigating').length}
              </div>
              <div className="text-gray-600">Under Investigation</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <CheckCircleOutlined className="text-2xl text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {disputes.filter(d => d.status === 'resolved').length}
              </div>
              <div className="text-gray-600">Resolved</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-2xl text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {disputes.filter(d => d.priority === 'urgent').length}
              </div>
              <div className="text-gray-600">Urgent Priority</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Search
              placeholder="Search disputes..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="all">All Status</Option>
              <Option value="open">Open</Option>
              <Option value="investigating">Investigating</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="closed">Closed</Option>
            </Select>
            <Select
              placeholder="Filter by type"
              style={{ width: 150 }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            >
              <Option value="all">All Types</Option>
              <Option value="service">Service</Option>
              <Option value="marketplace">Marketplace</Option>
              <Option value="delivery">Delivery</Option>
            </Select>
            <Select
              placeholder="Filter by priority"
              style={{ width: 150 }}
              value={filters.priority}
              onChange={(value) => handleFilterChange('priority', value)}
            >
              <Option value="all">All Priorities</Option>
              <Option value="urgent">Urgent</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
            <Button onClick={() => dispatch(clearFilters())}>Clear Filters</Button>
          </Space>
        </div>

        <Table
          columns={disputeColumns}
          dataSource={disputes}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Dispute Details Modal */}
      <Modal
        title="Dispute Details"
        open={disputeDetailModal}
        onCancel={() => setDisputeDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedDispute && (
          <div className="space-y-6">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Dispute ID">#{selectedDispute.id}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <div className="flex items-center">
                  <span className="mr-2">{getTypeIcon(selectedDispute.type)}</span>
                  <Tag color="blue">{selectedDispute.type.toUpperCase()}</Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={getPriorityColor(selectedDispute.priority)}>
                  {selectedDispute.priority.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedDispute.status)}>
                  {selectedDispute.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Complainant">
                <div>
                  <div className="font-medium">{selectedDispute.complainantName}</div>
                  <Tag color="blue">{selectedDispute.complainantType}</Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Respondent">
                <div>
                  <div className="font-medium">{selectedDispute.respondentName}</div>
                  <Tag color="green">{selectedDispute.respondentType}</Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>
                {new Date(selectedDispute.createdAt).toLocaleString()}
              </Descriptions.Item>
              {selectedDispute.resolvedAt && (
                <Descriptions.Item label="Resolved At" span={2}>
                  {new Date(selectedDispute.resolvedAt).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div>
              <h4 className="font-medium mb-2">Title</h4>
              <p>{selectedDispute.title}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p>{selectedDispute.description}</p>
            </div>

            {selectedDispute.resolution && (
              <div>
                <h4 className="font-medium mb-2">Resolution</h4>
                <p>{selectedDispute.resolution}</p>
                {selectedDispute.refundAmount && (
                  <p className="mt-2"><strong>Refund Amount:</strong> ${selectedDispute.refundAmount}</p>
                )}
              </div>
            )}

            {selectedDispute.adminNotes && (
              <div>
                <h4 className="font-medium mb-2">Admin Notes</h4>
                <p>{selectedDispute.adminNotes}</p>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Evidence ({selectedDispute.evidence?.length || 0})</h4>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={() => setEvidenceModal(true)}
                >
                  Add Evidence
                </Button>
              </div>
              {selectedDispute.evidence && selectedDispute.evidence.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {selectedDispute.evidence.map((evidence) => (
                    <div key={evidence.id} className="border p-3 rounded">
                      <div className="flex items-center mb-2">
                        <FileOutlined className="mr-2" />
                        <span className="font-medium">{evidence.type}</span>
                      </div>
                      {evidence.description && (
                        <p className="text-sm text-gray-600 mb-2">{evidence.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        Uploaded by {evidence.uploadedBy} on {new Date(evidence.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No evidence uploaded yet</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Resolve Dispute Modal */}
      <Modal
        title="Resolve Dispute"
        open={resolveModal}
        onCancel={() => setResolveModal(false)}
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
          <Form.Item
            name="adminNotes"
            label="Admin Notes (Optional)"
          >
            <TextArea rows={3} placeholder="Internal notes..." />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setResolveModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Resolve Dispute
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add Evidence Modal */}
      <Modal
        title="Add Evidence"
        open={evidenceModal}
        onCancel={() => setEvidenceModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddEvidence} layout="vertical">
          <Form.Item
            name="type"
            label="Evidence Type"
            rules={[{ required: true, message: 'Please select evidence type' }]}
          >
            <Select placeholder="Select evidence type">
              <Option value="image">Image</Option>
              <Option value="document">Document</Option>
              <Option value="chat_log">Chat Log</Option>
              <Option value="call_log">Call Log</Option>
              <Option value="transaction_record">Transaction Record</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="file"
            label="Upload File"
            rules={[{ required: true, message: 'Please upload a file' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <TextArea rows={3} placeholder="Describe the evidence..." />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setEvidenceModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Add Evidence
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Assign Dispute Modal */}
      <Modal
        title="Assign Dispute"
        open={assignModal}
        onCancel={() => setAssignModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAssignDispute} layout="vertical">
          <Form.Item
            name="adminId"
            label="Assign to Admin"
            rules={[{ required: true, message: 'Please select an admin' }]}
          >
            <Select placeholder="Select admin">
              <Option value="admin1">Admin 1</Option>
              <Option value="admin2">Admin 2</Option>
              <Option value="admin3">Admin 3</Option>
            </Select>
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Assign Dispute
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DisputeManagement;
