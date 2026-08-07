"use client"

import type { ReactNode } from "react"
import { type ColumnDef, type RowData, tableFeatures, useTable } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/table.tsx"
import { cn } from "#utils"

const dataTableFeatures = tableFeatures({})

type DataTableFeatures = typeof dataTableFeatures

type DataTableProps<TData extends RowData> = {
  className?: string
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  emptyMessage?: ReactNode
}

function DataTable<TData extends RowData>({
  className,
  columns,
  data,
  emptyMessage = "No results.",
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
  })

  return (
    <div data-slot="data-table" className={cn("overflow-hidden rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center"
                colSpan={table.getVisibleLeafColumns().length}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export { DataTable, dataTableFeatures, type DataTableFeatures, type DataTableProps }
