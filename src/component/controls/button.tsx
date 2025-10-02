import React from "react"
import { Button } from "antd"
import { useTheme } from "../../hooks"
import { getColors } from "../../config/static/colors"

type CustomButtonProps = {
  title: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onClick,
  disabled = false,
  loading = false,
  className = "",
}) => {
  const { theme } = useTheme()
  const { primaryColor } = getColors(theme)

  return (
    <Button
      type="primary"
      style={{
        backgroundColor: primaryColor,
        borderColor: primaryColor,
      }}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      className={className}
    >
      {title}
    </Button>
  )
}

export const CustomButtonOutline: React.FC<CustomButtonProps> = ({
  title,
  onClick,
  disabled = false,
  loading = false,
  className = "",
}) => {
  const { theme } = useTheme()
  const { primaryColor } = getColors(theme)

  return (
    <Button
      type="default"
      style={{
        borderColor: primaryColor,
        color: primaryColor,
      }}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      className={className}
    >
      {title}
    </Button>
  )
}
