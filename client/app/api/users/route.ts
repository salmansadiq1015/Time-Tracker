import { type NextRequest, NextResponse } from "next/server"

// Mock users database
const users = [
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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, role } = await request.json()

    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      createdAt: new Date(),
    }

    users.push(newUser)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
