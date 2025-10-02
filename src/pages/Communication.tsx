import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Input, Button, Space, Tag, Modal, Form, Select, message, Badge, Tabs } from 'antd';
import { 
  MessageOutlined, 
  PhoneOutlined, 
  SendOutlined, 
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage,
  fetchCallLogs,
  createConversation,
  initiateCall,
  setActiveConversation,
  markMessagesAsRead
} from '../store/slices/communicationSlice';

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Communication: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    conversations, 
    messages, 
    callLogs, 
    activeConversation, 
    loading, 
    unreadMessagesCount 
  } = useAppSelector((state) => state.communication);
  
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newConversationModal, setNewConversationModal] = useState(false);
  const [callModal, setCallModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchCallLogs({}));
  }, [dispatch]);

  useEffect(() => {
    if (activeConversation) {
      dispatch(fetchMessages(activeConversation.id));
      dispatch(markMessagesAsRead(activeConversation.id));
    }
  }, [activeConversation, dispatch]);

  const handleSelectConversation = (conversation: any) => {
    dispatch(setActiveConversation(conversation));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation) return;

    try {
      await dispatch(sendMessage({
        conversationId: activeConversation.id,
        message: messageText
      })).unwrap();
      setMessageText('');
    } catch (error) {
      message.error('Failed to send message');
    }
  };

  const handleCreateConversation = async (values: { userId: string; userType: string; subject?: string }) => {
    try {
      const conversation = await dispatch(createConversation({
        userId: values.userId,
        userType: values.userType,
        subject: values.subject
      })).unwrap();
      dispatch(setActiveConversation(conversation));
      setNewConversationModal(false);
      form.resetFields();
      message.success('Conversation created successfully');
    } catch (error) {
      message.error('Failed to create conversation');
    }
  };

  const handleInitiateCall = async (userId: string, userType: string) => {
    try {
      await dispatch(initiateCall({ userId, userType })).unwrap();
      message.success('Call initiated successfully');
      setCallModal(false);
    } catch (error) {
      message.error('Failed to initiate call');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getParticipantName = (conversation: any) => {
    const otherParticipant = conversation.participants.find((p: any) => p.type !== 'admin');
    return otherParticipant?.name || 'Unknown User';
  };

  const getParticipantType = (conversation: any) => {
    const otherParticipant = conversation.participants.find((p: any) => p.type !== 'admin');
    return otherParticipant?.type || 'user';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'blue';
      case 'professional': return 'green';
      case 'rider': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Communication Center</h1>
        <p className="text-gray-600">Chat and call with users for support and dispute resolution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <MessageOutlined className="text-2xl text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{conversations.length}</div>
              <div className="text-gray-600">Total Conversations</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <Badge count={unreadMessagesCount} className="mr-3">
              <MessageOutlined className="text-2xl text-green-500" />
            </Badge>
            <div>
              <div className="text-2xl font-bold">{unreadMessagesCount}</div>
              <div className="text-gray-600">Unread Messages</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <PhoneOutlined className="text-2xl text-orange-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{callLogs.length}</div>
              <div className="text-gray-600">Total Calls</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <HistoryOutlined className="text-2xl text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">
                {callLogs.filter(call => call.status === 'completed').length}
              </div>
              <div className="text-gray-600">Completed Calls</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card 
          title={
            <div className="flex justify-between items-center">
              <span>Conversations</span>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setNewConversationModal(true)}
              >
                New Chat
              </Button>
            </div>
          }
          className="h-96"
        >
          <div className="mb-4">
            <Search
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
          
          <div className="overflow-y-auto h-64">
            <List
              dataSource={filteredConversations}
              renderItem={(conversation) => (
                <List.Item
                  className={`cursor-pointer hover:bg-gray-50 ${
                    activeConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={conversation.unreadCount} size="small">
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{getParticipantName(conversation)}</span>
                        <Tag color={getTypeColor(getParticipantType(conversation))} size="small">
                          {getParticipantType(conversation)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div className="text-gray-600 text-sm truncate">
                          {conversation.lastMessage}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {formatTime(conversation.lastMessageTime)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card 
            title={
              activeConversation ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar icon={<UserOutlined />} className="mr-3" />
                    <div>
                      <div className="font-medium">{getParticipantName(activeConversation)}</div>
                      <Tag color={getTypeColor(getParticipantType(activeConversation))} size="small">
                        {getParticipantType(activeConversation)}
                      </Tag>
                    </div>
                  </div>
                  <Button 
                    icon={<PhoneOutlined />}
                    onClick={() => {
                      const participant = activeConversation.participants.find((p: any) => p.type !== 'admin');
                      if (participant) {
                        setSelectedUser(participant);
                        setCallModal(true);
                      }
                    }}
                  >
                    Call
                  </Button>
                </div>
              ) : 'Select a conversation'
            }
            className="h-96"
          >
            {activeConversation ? (
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderType === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    onPressEnter={handleSendMessage}
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Call Logs */}
      <Card title="Recent Call Logs" className="mt-6">
        <Tabs defaultActiveKey="all">
          <TabPane tab="All Calls" key="all">
            <List
              dataSource={callLogs}
              renderItem={(call) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<PhoneOutlined />} />}
                    title={
                      <div className="flex justify-between items-center">
                        <span>{call.callerName} → {call.receiverName}</span>
                        <Tag color={call.status === 'completed' ? 'green' : call.status === 'missed' ? 'red' : 'orange'}>
                          {call.status.toUpperCase()}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s</div>
                        <div className="text-gray-400 text-sm">{formatTime(call.timestamp)}</div>
                        {call.notes && <div className="text-gray-600 text-sm mt-1">{call.notes}</div>}
                      </div>
                    }
                  />
                </List.Item>
              )}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* New Conversation Modal */}
      <Modal
        title="Start New Conversation"
        open={newConversationModal}
        onCancel={() => setNewConversationModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateConversation} layout="vertical">
          <Form.Item
            name="userType"
            label="User Type"
            rules={[{ required: true, message: 'Please select user type' }]}
          >
            <Select placeholder="Select user type">
              <Option value="client">Client</Option>
              <Option value="professional">Professional</Option>
              <Option value="rider">Rider</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: 'Please enter user ID' }]}
          >
            <Input placeholder="Enter user ID" />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject (Optional)"
          >
            <Input placeholder="Conversation subject" />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setNewConversationModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Start Conversation
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Call Modal */}
      <Modal
        title="Initiate Call"
        open={callModal}
        onCancel={() => setCallModal(false)}
        footer={null}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="text-center">
              <Avatar size={64} icon={<UserOutlined />} />
              <h3 className="text-lg font-medium mt-2">{selectedUser.name}</h3>
              <Tag color={getTypeColor(selectedUser.type)}>{selectedUser.type}</Tag>
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                type="primary" 
                icon={<PhoneOutlined />}
                size="large"
                onClick={() => handleInitiateCall(selectedUser.id, selectedUser.type)}
              >
                Call Now
              </Button>
              <Button onClick={() => setCallModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Communication;
