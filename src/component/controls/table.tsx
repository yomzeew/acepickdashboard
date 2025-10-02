
import { Table } from "antd"
import type { TableProps } from "antd"

type CustomTableProps<RecordType> = TableProps<RecordType> & {
  mobileBreakpoint?: number // default 768px
}

export function CustomTable<RecordType extends object = any>({
  mobileBreakpoint = 768,
  ...props
}: CustomTableProps<RecordType>) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
      }}
      className="custom-table-wrapper"
    >
      <Table
        {...props}
        scroll={{
          x: typeof window !== "undefined" && window.innerWidth < mobileBreakpoint ? true : undefined,
          ...props.scroll,
        }}
      />
    </div>
  )
}
