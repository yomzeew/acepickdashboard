import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { homeRoute } from '../config';


const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 w-screen">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate(homeRoute)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back Home
          </Button>
        }
      />
    </div>
  );
};

export default Error404;
