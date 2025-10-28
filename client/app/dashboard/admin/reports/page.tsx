"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: Date;
  rows: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("Tuser");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    }

    // Mock reports
    setReports([
      {
        id: "1",
        name: "Weekly Time Summary",
        type: "Time Tracking",
        generatedAt: new Date(Date.now() - 86400000),
        rows: 156,
      },
      {
        id: "2",
        name: "User Activity Log",
        type: "User Management",
        generatedAt: new Date(Date.now() - 172800000),
        rows: 342,
      },
      {
        id: "3",
        name: "Monthly Productivity",
        type: "Analytics",
        generatedAt: new Date(Date.now() - 259200000),
        rows: 89,
      },
    ]);
  }, [router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and download system reports
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Recently generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30 hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{report.name}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{report.type}</span>
                    <span>{report.rows} rows</span>
                    <span>
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary/10"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
