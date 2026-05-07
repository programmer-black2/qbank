"use client";

import { DataGrid } from "@mui/x-data-grid";

interface Props {
  rows: any[];

  onDelete: (id: number) => void;
}

export default function QuestionTable({
  rows,
  onDelete,
}: Props) {
  const columns = [
    {
      field: "id",
      headerName: "#",
      width: 80,
    },

    {
      field: "question_text",
      headerName: "متن سوال",
      flex: 1,
    },

    {
      field: "question_type",
      headerName: "نوع سوال",
      width: 140,
    },

    {
      field: "difficulty",
      headerName: "سختی",
      width: 140,
    },

    {
      field: "actions",
      headerName: "عملیات",
      width: 150,

      renderCell: (params: any) => (
        <button
          onClick={() =>
            onDelete(params.row.id)
          }
          className="text-red-500"
        >
          حذف
        </button>
      ),
    },
  ];

  return (
    <div style={{ height: 600 }}>
      <DataGrid
        rows={rows}
        columns={columns}
      />
    </div>
  );
}