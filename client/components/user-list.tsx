"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { useAuthContent } from "@/app/context/authContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "dispatcher" | "admin";
  createdAt: Date;
}

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}

export function UserList({
  users,
  onEdit,
  onDelete,
  canManage,
}: UserListProps) {
  const { auth } = useAuthContent();
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive";
      case "dispatcher":
        return "bg-accent/10 text-accent";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Card className="border-border/50 py-0 px-0 bg-gray-900 overflow-hidden ">
      <CardContent className="py-0 px-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Joined
                </th>
                {auth.user?.role === "admin" && (
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    {auth.user?.role === "admin" && (
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(user)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(user._id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
