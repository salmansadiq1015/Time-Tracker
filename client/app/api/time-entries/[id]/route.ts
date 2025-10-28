import { type NextRequest, NextResponse } from "next/server"

// Mock time entries database
let timeEntries = [
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { endTime, endLocation, duration } = await request.json()
    const entryId = params.id

    const entryIndex = timeEntries.findIndex((e) => e.id === entryId)

    if (entryIndex === -1) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    timeEntries[entryIndex] = {
      ...timeEntries[entryIndex],
      endTime: new Date(endTime),
      endLocation,
      duration,
    }

    return NextResponse.json(timeEntries[entryIndex])
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

    const entryId = params.id
    timeEntries = timeEntries.filter((e) => e.id !== entryId)

    return NextResponse.json({ message: "Entry deleted" })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
