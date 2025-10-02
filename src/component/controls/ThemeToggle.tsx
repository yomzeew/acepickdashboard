import React from 'react';
import { Switch, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: (isDark: boolean) => void;
  size?: 'small' | 'default';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  isDark, 
  onToggle, 
  size = 'default' 
}) => {
  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <Switch
        checked={isDark}
        onChange={onToggle}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
        size={size}
        className="bg-gray-200 dark:bg-gray-600"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
