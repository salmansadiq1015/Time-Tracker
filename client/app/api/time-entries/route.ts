import { type NextRequest, NextResponse } from "next/server"

// Mock time entries database
const timeEntries = [
  {
    id: "1",
    userId: "1",
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() - 1800000),
    startLocation: { lat: 40.7128, lng: -74.006, address: "New York, NY" },
    endLocation: { lat: 40.758, lng: -73.9855, address: "Times Square, NY" },
    description: "Client Meeting",
    duration: 0.5,
  },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ entries: timeEntries })
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

    const { userId, startTime, startLocation, description } = await request.json()

    const newEntry = {
      id: Date.now().toString(),
      userId,
      startTime: new Date(startTime),
      startLocation,
      description,
    }

    timeEntries.push(newEntry)

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
