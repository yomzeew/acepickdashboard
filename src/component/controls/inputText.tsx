import React from "react"
import { Input } from "antd"
import { useTheme } from "../../hooks"
import { getColors } from "../../config/static/colors"

type CustomInputProps = {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  type?: string
  allowClear?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  className?: string
}

export const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChange,
  disabled = false,
  type = "text",
  allowClear = true,
  prefix,
  suffix,
  className = "",
}) => {
  const { theme } = useTheme()
  const { primaryColor } = getColors(theme)

  return (
    <Input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      prefix={prefix}
      suffix={suffix}
      className={className}
      style={{
        borderColor: primaryColor,
        boxShadow: "none",
      }}
    />
  )
}

export const CustomPasswordInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChange,
  disabled = false,
  allowClear = true,
  prefix,
  suffix,
  className = "",
}) => {
  const { theme } = useTheme()
  const { primaryColor } = getColors(theme)

  return (
    <Input.Password
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      prefix={prefix}
      suffix={suffix}
      className={className}
      style={{
        borderColor: primaryColor,
        boxShadow: "none",
      }}
    />
  )
}
