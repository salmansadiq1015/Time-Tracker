import { type NextRequest, NextResponse } from "next/server"

// Mock user database
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    password: "password123",
    role: "user",
  },
  {
    id: "3",
    name: "Dispatcher",
    email: "dispatcher@example.com",
    password: "password123",
    role: "dispatcher",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
