"use client"

import { Trash2, Edit2, Check, X, Plus } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface Component {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  confidence?: number
}

interface ComponentsListProps {
  components: Component[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Component>) => void
  isDetecting: boolean
  onHoverComponent: (id: string | null) => void
  selectedComponentId?: string | null
  onSelectComponent?: (id: string | null) => void
}

export default function ComponentsList({
  components,
  onDelete,
  onUpdate,
  isDetecting,
  onHoverComponent,
  selectedComponentId,
  onSelectComponent,
}: ComponentsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [manualComponent, setManualComponent] = useState({
    name: "",
    x: "0",
    y: "0",
    width: "100",
    height: "100",
  })
  const [activeTab, setActiveTab] = useState<"components" | "statistics">("components")
  const selectedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedComponentId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [selectedComponentId])

  const handleStartEdit = (component: Component) => {
    setEditingId(component.id)
    setEditName(component.name)
  }

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdate(id, { name: editName.trim() })
    }
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  const stats = components.reduce((acc, curr) => {
    acc[curr.name] = (acc[curr.name] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedStats = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-black">Component Overview</h2>
        </div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setActiveTab("components")}
            className={`px-4 py-1 rounded-sm text-sm font-medium transition-colors ${activeTab === "components" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Components
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`px-4 py-1 rounded-sm text-sm font-medium transition-colors ${activeTab === "statistics" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Statistics
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {components.length} component{components.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-3">
          {activeTab === "components" ? (
            isDetecting ? (
              <div className="text-center py-8">
                <div className="inline-block animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3 mx-auto" />
                  <p className="text-sm text-gray-600">Analyzing...</p>
                </div>
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">No components detected yet.</p>
                <p className="text-xs text-gray-500 mt-2">Hold Shift and drag on the canvas to add a new box.</p>
              </div>
            ) : (
              components.map((component) => (
                <div
                  key={component.id}
                  ref={selectedComponentId === component.id ? selectedRef : null}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${selectedComponentId === component.id
                    ? "bg-gray-100 border-black ring-2 ring-gray-300"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  onMouseEnter={() => onHoverComponent(component.id)}
                  onMouseLeave={() => onHoverComponent(null)}
                  onClick={() => onSelectComponent?.(component.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {editingId === component.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(component.id)
                              if (e.key === "Escape") handleCancelEdit()
                            }}
                            className="flex-1 h-8 px-2 bg-gray-100 border border-gray-300 rounded text-sm text-black focus:outline-none focus:border-black"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(component.id)}
                            className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-black truncate">{component.name}</h3>
                            {component.confidence && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono shrink-0">
                                {Math.round(component.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-xs text-gray-600 font-mono">
                              Position: ({Math.round(component.x)}, {Math.round(component.y)})
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {editingId !== component.id && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(component)
                          }}
                          className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(component.id)
                          }}
                          className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="space-y-3">
              {sortedStats.length === 0 ? (
                <p className="text-center text-sm text-gray-600 py-8">No components to show statistics for.</p>
              ) : (
                sortedStats.map((stat) => (
                  <div key={stat.name} className="p-3 rounded-lg border bg-white border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-black">{stat.name}</h3>
                      <span className="text-sm font-medium text-gray-700">
                        {stat.count} item{stat.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>


    </div>
  )
}