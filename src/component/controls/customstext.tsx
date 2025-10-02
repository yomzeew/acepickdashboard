import React from 'react';
import { Typography } from 'antd';

const { Text, Title, Paragraph } = Typography;

interface CustomTextProps {
  children: React.ReactNode;
  type?: 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'default' | 'large';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  ellipsis?: boolean;
  copyable?: boolean;
  code?: boolean;
  mark?: boolean;
  underline?: boolean;
  delete?: boolean;
  strong?: boolean;
  italic?: boolean;
}

interface CustomTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  ellipsis?: boolean;
  copyable?: boolean;
  type?: 'secondary' | 'success' | 'warning' | 'danger';
}

interface CustomParagraphProps {
  children: React.ReactNode;
  className?: string;
  ellipsis?: boolean | { rows?: number; expandable?: boolean; symbol?: string };
  copyable?: boolean;
  type?: 'secondary' | 'success' | 'warning' | 'danger';
}

export const CustomText: React.FC<CustomTextProps> = ({
  children,
  type,
  size = 'default',
  weight = 'normal',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const combinedClassName = `${sizeClasses[size]} ${weightClasses[weight]} ${className}`;

  return (
    <Text 
      type={type} 
      className={combinedClassName}
      {...props}
    >
      {children}
    </Text>
  );
};

export const CustomTitle: React.FC<CustomTitleProps> = ({
  children,
  level = 1,
  className = '',
  ...props
}) => {
  return (
    <Title 
      level={level} 
      className={className}
      {...props}
    >
      {children}
    </Title>
  );
};

export const CustomParagraph: React.FC<CustomParagraphProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <Paragraph 
      className={className}
      {...props}
    >
      {children}
    </Paragraph>
  );
};
