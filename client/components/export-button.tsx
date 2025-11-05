import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

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
  photos?: string[];
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
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'User Name',
      'User Email',
      'Description',
      'Start Time',
      'Start Location',
      'End Time',
      'End Location',
      'Duration (h:m)',
      'Photos Count',
      'Status',
      'Created At',
    ];

    const rows = entries.map((entry) => [
      entry._id,
      entry.user?.name || 'N/A',
      entry.user?.email || 'N/A',
      entry.description,
      formatDateTime(entry.start.startTime),
      entry.start.location,
      entry.end ? formatDateTime(entry.end.endTime) : 'N/A',
      entry.end?.location || 'N/A',
      entry.duration ? formatDuration(entry.duration) : '0h:0m',
      entry.photos?.length || 0,
      entry.isActive ? 'Active' : 'Completed',
      formatDateTime(entry.createdAt),
    ]);

    // Add summary row
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Count', summary.totalCount.toString()]);
    rows.push(['Total Duration', formatDuration(parseFloat(summary.totalDuration))]);
    rows.push(['Total Leaves', summary.totalLeaves.toString()]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `time-tracker-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    // Helper function to convert image URL to base64
    const imageToBase64 = async (url: string): Promise<string> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
        return url; // Fallback to URL if conversion fails
      }
    };

    // Convert all images to base64
    const entriesWithImages = await Promise.all(
      entries.map(async (entry) => {
        if (entry.photos && entry.photos.length > 0) {
          const base64Images = await Promise.all(entry.photos.map((url) => imageToBase64(url)));
          return { ...entry, base64Photos: base64Images };
        }
        return entry;
      })
    );

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
            vertical-align: top;
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
          .photo-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 4px;
          }
          .photo-item {
            width: 100%;
            min-width: 20px;
            min-height: 20px;
            max-width: 200px;
            height: auto;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
            display: block;
            margin-bottom: 8px;
          }
          .photo-link {
            color: #0ea5e9;
            text-decoration: underline;
            font-size: 7pt;
            display: block;
            margin-top: 2px;
          }
          .photo-count {
            font-size: 7pt;
            color: #666;
            margin-top: 2px;
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
            <div class="summary-value">${formatDuration(parseFloat(summary.totalDuration))}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Leaves</div>
            <div class="summary-value">${summary.totalLeaves}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">User</th>
              <th style="width: 15%;">Description</th>
              <th style="width: 12%;">Start Time</th>
              <th style="width: 12%;">End Time</th>
              <th style="width: 12%;">Start Location</th>
              <th style="width: 12%;">End Location</th>
              <th style="width: 8%;">Duration</th>
              <th style="width: 6%;">Photos</th>
              <th style="width: 4%;">Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    entriesWithImages.forEach((entry: any) => {
      let photosHtml = '';
      if (entry.base64Photos && entry.base64Photos.length > 0) {
        photosHtml = '<div class="photo-grid">';
        entry.base64Photos.forEach((base64: string, idx: number) => {
          const originalUrl = entry.photos && entry.photos[idx] ? entry.photos[idx] : '';
          const photoNumber = idx + 1;
          photosHtml += `
            <div>
              <img src="${base64}" alt="Photo ${photoNumber}" class="photo-item" style="min-width: 20px; min-height: 20px;" />
              ${
                originalUrl
                  ? `<a href="${originalUrl}" target="_blank" class="photo-link">Open Photo ${photoNumber} in New Tab</a>`
                  : ''
              }
            </div>
          `;
        });
        photosHtml += '</div>';
      } else {
        photosHtml = '<span class="photo-count">-</span>';
      }

      html += `
        <tr>
          <td>${entry.user?.name || 'N/A'}</td>
          <td>${entry.description}</td>
          <td>${formatDateTime(entry.start.startTime)}</td>
          <td>${entry.end ? formatDateTime(entry.end.endTime) : 'N/A'}</td>
          <td>${entry.start.location}</td>
          <td>${entry.end?.location || 'N/A'}</td>
          <td>${entry.duration ? formatDuration(entry.duration) : 'N/A'}</td>
          <td>${photosHtml}</td>
          <td>
            <span class="${entry.isActive ? 'status-active' : 'status-completed'}">
              ${entry.isActive ? 'Active' : 'Done'}
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

    const printWindow = window.open('', '_blank');
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
