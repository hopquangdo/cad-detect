"use client"

import type React from "react"
import { useState } from "react"
import ComponentsList from "@/components/components-list"
import Header from "@/components/header"
import UploadArea from "@/components/upload-area"
import CanvasArea from "@/components/canvas/canvas-area"
import Footer from "@/components/footer"

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [components, setComponents] = useState<
    Array<{
      id: string
      name: string
      x: number
      y: number
      width: number
      height: number
      confidence?: number
      text?: string
    }>
  >([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string
      setUploadedImage(imageUrl)

      setIsDetecting(true)
      await callDetectAPI(file)
      setIsDetecting(false)
    }
    reader.readAsDataURL(file)
  }

  const callDetectAPI = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        body: formData,
      })
      console.log(response)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        setComponents(data)
      } else {
        console.error("Unexpected API response:", data)
        alert("API returned unexpected data format")
      }
    } catch (error) {
      console.error("Failed to detect components:", error)
      alert("Failed to detect components. Check console for details.")
    }
  }

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id))
  }

  const handleUpdateComponent = (id: string, updates: Partial<(typeof components)[0]>) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />

      <main className="flex-1 px-6 py-6 overflow-hidden">
        {!uploadedImage ? (
          <UploadArea onFileUpload={handleFileUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <CanvasArea
              imageUrl={uploadedImage}
              components={components}
              onUpdateComponent={handleUpdateComponent}
              isDetecting={isDetecting}
              hoveredComponentId={hoveredComponentId}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              onChangeImage={handleFileUpload}
            />

            <div className="lg:col-span-1 flex flex-col min-h-0">
              <ComponentsList
                components={components}
                onDelete={handleDeleteComponent}
                onUpdate={handleUpdateComponent}
                isDetecting={isDetecting}
                onHoverComponent={setHoveredComponentId}
                selectedComponentId={selectedComponentId}
                onSelectComponent={setSelectedComponentId}
              />
            </div>
          </div>
        )}
      </main>

      {uploadedImage && (<Footer componentsCount={10} />)}

    </div>
  )
}
