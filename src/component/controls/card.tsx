import React from "react"
import { Card } from "antd"
import { useTheme } from "../../hooks"
import { getColors } from "../../config/static/colors"

type CustomCardProps = {
  title?: React.ReactNode
  extra?: React.ReactNode
  children?: React.ReactNode
  bordered?: boolean
  loading?: boolean
  hoverable?: boolean
  className?: string
  style?: React.CSSProperties
}

export const CustomCard: React.FC<CustomCardProps> = ({
  title,
  extra,
  children,
  bordered = true,
  loading = false,
  hoverable = true,
  className = "",
  style,
}) => {
  const { theme } = useTheme()
  const { primaryColor } = getColors(theme)

  return (
    <Card
      title={title}
      extra={extra}
      bordered={bordered}
      hoverable={hoverable}
      loading={loading}
      className={className}
      style={{
        borderColor: primaryColor,
        borderRadius: 12,
        boxShadow: hoverable
          ? "0 4px 12px rgba(0, 0, 0, 0.1)"
          : "0 2px 6px rgba(0, 0, 0, 0.05)",
        ...style,
      }}
      headStyle={{
        borderBottom: `1px solid ${primaryColor}`,
        fontWeight: 600,
        color: primaryColor,
      }}
    >
      {children}
    </Card>
  )
}
