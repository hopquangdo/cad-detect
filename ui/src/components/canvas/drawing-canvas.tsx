"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Loader2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

interface Component {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  confidence?: number
}

interface DrawingCanvasProps {
  imageUrl: string
  components: Component[]
  onUpdateComponent: (id: string, updates: Partial<Component>) => void
  isDetecting: boolean
  hoveredComponentId?: string | null
  selectedComponentId?: string | null
  onSelectComponent?: (id: string | null) => void
}

export default function DrawingCanvas({
  imageUrl,
  components,
  onUpdateComponent,
  isDetecting,
  hoveredComponentId,
  selectedComponentId,
  onSelectComponent,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isDraggingComponent, setIsDraggingComponent] = useState(false)
  const [draggedComponentStart, setDraggedComponentStart] = useState({ x: 0, y: 0 })
  const [minScale, setMinScale] = useState(0.1)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImage(img)
      if (containerRef.current) {
        const container = containerRef.current
        const scaleX = (container.clientWidth - 40) / img.width
        const scaleY = (container.clientHeight - 40) / img.height
        const fitScale = Math.min(scaleX, scaleY)
        const calculatedMinScale = Math.min(1.0, fitScale)
        setMinScale(calculatedMinScale)
        const initialScale = Math.max(calculatedMinScale, fitScale)
        setScale(initialScale)
        setOffset({
          x: (container.clientWidth - img.width * initialScale) / 2,
          y: (container.clientHeight - img.height * initialScale) / 2,
        })
      }
    }
    img.src = imageUrl
  }, [imageUrl])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !image) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()

    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    ctx.drawImage(image, 0, 0)

    components.forEach((component) => {
      const isHovered = hoveredComponentId === component.id
      const isSelected = selectedComponentId === component.id

      if (isHovered) {
        ctx.shadowColor = "#666666"
        ctx.shadowBlur = 15 / scale
        ctx.strokeStyle = "#666666"
        ctx.lineWidth = 4 / scale
      } else if (isSelected) {
        ctx.shadowColor = "#000000"
        ctx.shadowBlur = 10 / scale
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 3 / scale
      } else {
        ctx.shadowBlur = 0
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2 / scale
      }

      ctx.strokeRect(component.x, component.y, component.width, component.height)

      ctx.shadowBlur = 0

      ctx.fillStyle = isHovered
        ? "rgba(102, 102, 102, 0.95)"
        : isSelected
          ? "rgba(0, 0, 0, 0.95)"
          : "rgba(0, 0, 0, 0.9)"
      const labelPadding = 4 / scale
      const fontSize = isHovered || isSelected ? 14 / scale : 12 / scale
      ctx.font = `${isHovered || isSelected ? "bold" : "normal"} ${fontSize}px sans-serif`
      const textWidth = ctx.measureText(component.name).width
      ctx.fillRect(
        component.x,
        component.y - fontSize - labelPadding * 2,
        textWidth + labelPadding * 2,
        fontSize + labelPadding * 2,
      )

      ctx.fillStyle = "#ffffff"
      ctx.fillText(component.name, component.x + labelPadding, component.y - labelPadding)
    })

    if (currentBox) {
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2 / scale
      ctx.setLineDash([5 / scale, 5 / scale])
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height)
      ctx.setLineDash([])
    }

    ctx.restore()
  }, [image, scale, offset, components, currentBox, selectedComponentId, hoveredComponentId])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      draw()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [draw])

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(minScale, scale * delta), 10)

    const scaleChange = newScale / scale
    setOffset({
      x: mouseX - (mouseX - offset.x) * scaleChange,
      y: mouseY - (mouseY - offset.y) * scaleChange,
    })
    setScale(newScale)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const imageX = (mouseX - offset.x) / scale
    const imageY = (mouseY - offset.y) / scale

    const clickedComponent = components.find(
      (c) => imageX >= c.x && imageX <= c.x + c.width && imageY >= c.y && imageY <= c.y + c.height,
    )

    if (clickedComponent) {
      onSelectComponent?.(clickedComponent.id)
      if (selectedComponentId === clickedComponent.id) {
        setIsDraggingComponent(true)
        setDraggedComponentStart({ x: imageX - clickedComponent.x, y: imageY - clickedComponent.y })
      }
      return
    }

    onSelectComponent?.(null)

    if (e.shiftKey) {
      setIsDrawing(true)
      setDrawStart({ x: imageX, y: imageY })
      setCurrentBox({ x: imageX, y: imageY, width: 0, height: 0 })
    } else {
      setIsDragging(true)
      setDragStart({ x: mouseX - offset.x, y: mouseY - offset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    if (isDraggingComponent && selectedComponentId) {
      const imageX = (mouseX - offset.x) / scale
      const imageY = (mouseY - offset.y) / scale

      const newX = imageX - draggedComponentStart.x
      const newY = imageY - draggedComponentStart.y

      onUpdateComponent(selectedComponentId, { x: newX, y: newY })
    } else if (isDragging) {
      setOffset({
        x: mouseX - dragStart.x,
        y: mouseY - dragStart.y,
      })
    } else if (isDrawing) {
      const imageX = (mouseX - offset.x) / scale
      const imageY = (mouseY - offset.y) / scale

      setCurrentBox({
        x: Math.min(drawStart.x, imageX),
        y: Math.min(drawStart.y, imageY),
        width: Math.abs(imageX - drawStart.x),
        height: Math.abs(imageY - drawStart.y),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsDrawing(false)
    setCurrentBox(null)
    setIsDraggingComponent(false)
  }

  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 10)
    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const scaleChange = newScale / scale

    setOffset({
      x: centerX - (centerX - offset.x) * scaleChange,
      y: centerY - (centerY - offset.y) * scaleChange,
    })
    setScale(newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale * 0.8, minScale)
    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const scaleChange = newScale / scale

    setOffset({
      x: centerX - (centerX - offset.x) * scaleChange,
      y: centerY - (centerY - offset.y) * scaleChange,
    })
    setScale(newScale)
  }

  const handleResetView = () => {
    if (!image || !containerRef.current) return

    const container = containerRef.current
    const scaleX = (container.clientWidth - 40) / image.width
    const scaleY = (container.clientHeight - 40) / image.height
    const fitScale = Math.min(scaleX, scaleY)
    const initialScale = Math.max(minScale, fitScale)

    setScale(initialScale)
    setOffset({
      x: (container.clientWidth - image.width * initialScale) / 2,
      y: (container.clientHeight - image.height * initialScale) / 2,
    })
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {isDetecting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm text-gray-600">Detecting components...</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-move"
        style={{
          cursor: isDrawing ? "crosshair" : isDragging ? "grabbing" : isDraggingComponent ? "move" : "grab",
        }}
      />

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md border border-gray-300">
        <p className="text-xs text-gray-600">
          <span className="font-semibold text-black">Scroll:</span> Zoom •
          <span className="font-semibold text-black"> Drag:</span> Pan •
          <span className="font-semibold text-black"> Shift+Drag:</span> Add Box •
          <span className="font-semibold text-black"> Click:</span> Select •
          <span className="font-semibold text-black"> Drag Selected:</span> Move
        </p>
      </div>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-gray-300">
        <p className="text-xs font-mono text-black">{Math.round(scale * 100)}%</p>
      </div>
    </div>
  )
}
