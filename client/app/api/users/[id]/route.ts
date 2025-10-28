import { type NextRequest, NextResponse } from "next/server"

// Mock users database (shared with GET /api/users)
let users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "dispatcher",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    createdAt: new Date("2024-02-01"),
  },
]

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, role } = await request.json()
    const userId = params.id

    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    users[userIndex] = { ...users[userIndex], name, email, role }

    return NextResponse.json(users[userIndex])
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    users = users.filter((u) => u.id !== userId)

    return NextResponse.json({ message: "User deleted" })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
