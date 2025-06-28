"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { markAttendance } from "./employeeActions"
import { Clock, MapPin, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"

interface Attendance {
  id: string
  date: Date
  checkIn: Date | null
  checkInLatitude?: number | null
  checkInLongitude?: number | null
  checkOut: Date | null
  checkOutLatitude?: number | null
  checkOutLongitude?: number | null
  markedBy: string
}

interface AttendanceComponentProps {
  employeeId: string
  attendance: Attendance[]
}

export default function AttendanceComponent({ employeeId, attendance }: AttendanceComponentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = attendance.find((a) => {
    const date = a.date.toISOString().split("T")[0]
    return date === today
  })

  const getLocation = async (): Promise<{ latitude: number; longitude: number; accuracy: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser")
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (err: GeolocationPositionError) => {
          let errorMessage = "Failed to get location. Please allow location access."
          if (err.code === 1) errorMessage = "Location access denied by user."
          if (err.code === 2) errorMessage = "Location unavailable. Try moving to an open area."
          if (err.code === 3) errorMessage = "Location request timed out."
          setError(errorMessage)
          console.error("Geolocation error:", err)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  const handleAttendance = async (type: "checkin" | "checkout") => {
    setLoading(true)
    setError(null)
    
    try {
      const location = await getLocation()

      if (location) {
        if (location.accuracy > 100) {
          setError(`Location accuracy is low (${location.accuracy.toFixed(1)}m). Try moving to an open area and retry.`)
          setLoading(false)
          return
        }
        
        await markAttendance(employeeId, type, {
          latitude: location.latitude,
          longitude: location.longitude,
        })
        
        setRetryCount(0)
        window.location.reload()
      } else {
        setLoading(false)
      }
    } catch {
      setError("Failed to mark attendance. Please try again.")
      setLoading(false)
    }
  }

  const handleRetry = (type: "checkin" | "checkout") => {
    setRetryCount(retryCount + 1)
    handleAttendance(type)
  }

  const getGoogleMapsUrl = (latitude?: number | null, longitude?: number | null) => {
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`
    }
    return null
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Today&apos;s Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {todayAttendance?.checkIn ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Checked In:</span>
                <span className="text-sm text-gray-900">
                  {new Date(todayAttendance.checkIn).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </span>
                {todayAttendance.checkInLatitude && todayAttendance.checkInLongitude && (
                  <a
                    href={getGoogleMapsUrl(todayAttendance.checkInLatitude, todayAttendance.checkInLongitude) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="text-xs">View Location</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-500">Not checked in yet</span>
              </div>
            )}

            {todayAttendance?.checkOut ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Checked Out:</span>
                <span className="text-sm text-gray-900">
                  {new Date(todayAttendance.checkOut).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </span>
                {todayAttendance.checkOutLatitude && todayAttendance.checkOutLongitude && (
                  <a
                    href={getGoogleMapsUrl(todayAttendance.checkOutLatitude, todayAttendance.checkOutLongitude) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="text-xs">View Location</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-500">Not checked out yet</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!todayAttendance ? (
              <>
                <Button
                  onClick={() => handleAttendance("checkin")}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Check In
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => handleRetry("checkin")}
                  disabled={loading}
                  variant="outline"
                  className="border-gray-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry ({retryCount})
                </Button>
              </>
            ) : !todayAttendance.checkOut ? (
              <>
                <Button
                  onClick={() => handleAttendance("checkout")}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Check Out
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => handleRetry("checkout")}
                  disabled={loading}
                  variant="outline"
                  className="border-gray-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry ({retryCount})
                </Button>
              </>
            ) : (
              <div className="col-span-2 text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-700 font-medium">Attendance completed for today</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for accurate location:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Ensure GPS is enabled on your device</li>
              <li>• Move to an open area for better GPS signal</li>
              <li>• Allow location access when prompted</li>
              <li>• Retry if location accuracy is low</li>
              <li>• If none of the above solutions are possible, Ask HR to mark attendance for you</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance && attendance.length > 0 ? (
            <div className="space-y-4">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>
                      <span className="ml-2 text-gray-900">
                        {record.date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Check In:</span>
                      <span className="ml-2 text-gray-900">
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })
                          : "Not checked in"}
                      </span>
                      {record.checkInLatitude && record.checkInLongitude && (
                        <a
                          href={getGoogleMapsUrl(record.checkInLatitude, record.checkInLongitude) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-2 text-xs"
                        >
                          [Map]
                        </a>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Check Out:</span>
                      <span className="ml-2 text-gray-900">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })
                          : "Not checked out"}
                      </span>
                      {record.checkOutLatitude && record.checkOutLongitude && (
                        <a
                          href={getGoogleMapsUrl(record.checkOutLatitude, record.checkOutLongitude) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-2 text-xs"
                        >
                          [Map]
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
