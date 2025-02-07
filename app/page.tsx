"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchHubs, fetchCSVData, convertToExcel } from "../utils/dataUtils"
import axios from "axios"

async function login() {
  console.debug("Attempting to log in.....")
  const response = await axios.post(
    "https://projectxuaeapi.shipsy.io/api/dashboard/login",
    {
      username: "data@chronodiali.ma",
      pwd: "lGU2flbcnsemIdr4QlIFTkzRvl5zyMJTT/b2YZz714DrQDk3K5pmGcGbYjcmM5CXmCWa8v4AnB3kr7x2IZkcNov5/9WS0UQv0d7NKs0hhN373vAn7HR9zrDbNp8aFW3sCWLvbdieonO0Q0prs6mRB3pU3wFgxwCwK+SNSKtEv5XCdxQ96E9YMxcTPT0p5N6+Ue1/rbZeRbN7VlxuglH/aVjBnlqNELuODzKiP7WdFSvTtdWsGNnjh4q8QWuIy1GPMdXiTGONiU/7IJXemKfpDYdeM4jkGSpC6CCuLLNkJdA9Z+59XUysonKC/3anXvgfvnuWjgW1mTEXZ7rD1cTLrg==",
    },
    { headers: { "organisation-id": "chronodiali" } },
  )
  console.debug("Login successful, access token received.")
  return response.data.data.access_token.id
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hubs, setHubs] = useState<Array<{ id: string; name: string }>>([])
  const [selectedHub, setSelectedHub] = useState<string | null>(null)

  useEffect(() => {
    const loadHubs = () => {
      try {
        const hubsData = fetchHubs()
        setHubs(hubsData)
      } catch (err) {
        console.error("Error loading hubs:", err)
        setError("Failed to load hubs. Please try again.")
      }
    }

    loadHubs()
  }, [])

  const handleConvert = async () => {
    if (!selectedHub) {
      setError("Please select a hub first.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const accessToken = await login()
      const csvData = await fetchCSVData(accessToken, selectedHub)
      const excelBuffer = await convertToExcel(csvData)

      // Create a Blob from the Excel buffer
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "converted_data.xlsx")
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err) {
      setError("An error occurred during the conversion process.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>CSV to Excel Converter</CardTitle>
          <CardDescription>Select a hub and convert CSV to Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedHub}>
            <SelectTrigger>
              <SelectValue placeholder="Select a hub" />
            </SelectTrigger>
            <SelectContent>
              {hubs.map((hub) => (
                <SelectItem key={hub.id} value={hub.id}>
                  {hub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleConvert} disabled={isLoading || !selectedHub}>
            {isLoading ? "Converting..." : "Convert CSV to Excel"}
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

