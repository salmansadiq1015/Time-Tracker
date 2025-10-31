import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

interface TimeEntry {
  _id: string;
  start: {
    startTime: string;
    location: string;
    lat: number;
    lng: number;
  };
  end?: {
    endTime: string;
    location: string;
    lat: number;
    lng: number;
  };
  description: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface ExportButtonsProps {
  entries: TimeEntry[];
  summary: {
    totalDuration: string;
    totalLeaves: number;
    totalCount: number;
  };
}

export const ExportButtons = ({ entries, summary }: ExportButtonsProps) => {
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hrs}h:${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "User Name",
      "User Email",
      "Description",
      "Start Time",
      "Start Location",
      "End Time",
      "End Location",
      "Duration (h:m)",
      "Status",
      "Created At",
    ];

    const rows = entries.map((entry) => [
      entry._id,
      entry.user?.name || "N/A",
      entry.user?.email || "N/A",
      entry.description,
      formatDateTime(entry.start.startTime),
      entry.start.location,
      entry.end ? formatDateTime(entry.end.endTime) : "N/A",
      entry.end?.location || "N/A",
      entry.duration ? formatDuration(entry.duration) : "0h:0m",
      entry.isActive ? "Active" : "Completed",
      formatDateTime(entry.createdAt),
    ]);

    // Add summary row
    rows.push([]);
    rows.push(["SUMMARY"]);
    rows.push(["Total Count", summary.totalCount.toString()]);
    rows.push([
      "Total Duration",
      formatDuration(parseFloat(summary.totalDuration)),
    ]);
    rows.push(["Total Leaves", summary.totalLeaves.toString()]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `time-tracker-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Time Tracker Report</title>
        <style>
          @page {
            size: A4;
            margin: ${margin}mm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            color: #0ea5e9;
            font-size: 20pt;
          }
          .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 9pt;
          }
          .summary {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-label {
            font-size: 8pt;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-value {
            font-size: 16pt;
            font-weight: bold;
            color: #0ea5e9;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 8pt;
          }
          th {
            background: #0ea5e9;
            color: white;
            padding: 8px 4px;
            text-align: left;
            font-weight: bold;
            font-size: 8pt;
          }
          td {
            padding: 6px 4px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .status-active {
            display: inline-block;
            padding: 2px 6px;
            background: #dcfce7;
            color: #166534;
            border-radius: 4px;
            font-size: 7pt;
            font-weight: bold;
          }
          .status-completed {
            display: inline-block;
            padding: 2px 6px;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 4px;
            font-size: 7pt;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 8pt;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Time Tracker Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Count</div>
            <div class="summary-value">${summary.totalCount}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Duration</div>
            <div class="summary-value">${formatDuration(
              parseFloat(summary.totalDuration)
            )}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Leaves</div>
            <div class="summary-value">${summary.totalLeaves}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 12%;">User</th>
              <th style="width: 18%;">Description</th>
              <th style="width: 14%;">Start Time</th>
              <th style="width: 14%;">End Time</th>
              <th style="width: 15%;">Start Location</th>
              <th style="width: 15%;">End Location</th>
              <th style="width: 8%;">Duration</th>
              <th style="width: 4%;">Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    entries.forEach((entry) => {
      html += `
        <tr>
          <td>${entry.user?.name || "N/A"}</td>
          <td>${entry.description}</td>
          <td>${formatDateTime(entry.start.startTime)}</td>
          <td>${entry.end ? formatDateTime(entry.end.endTime) : "N/A"}</td>
          <td>${entry.start.location}</td>
          <td>${entry.end?.location || "N/A"}</td>
          <td>${entry.duration ? formatDuration(entry.duration) : "N/A"}</td>
          <td>
            <span class="${
              entry.isActive ? "status-active" : "status-completed"
            }">
              ${entry.isActive ? "Active" : "Done"}
            </span>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>

        <div class="footer">
          <p>Time Tracker System - Confidential Report</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={exportToCSV}
        variant="outline"
        className="flex items-center gap-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export CSV
      </Button>
      <Button
        onClick={exportToPDF}
        variant="outline"
        className="flex items-center gap-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </Button>
    </div>
  );
};
