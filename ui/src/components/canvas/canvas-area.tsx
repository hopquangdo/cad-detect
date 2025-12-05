"use client"

import React from "react"
import DrawingCanvas from "@/components/canvas/drawing-canvas"

interface CanvasAreaProps {
    imageUrl: string
    components: any[]
    onUpdateComponent: (id: string, updates: any) => void
    isDetecting: boolean
    hoveredComponentId: string | null
    selectedComponentId: string | null
    onSelectComponent: (id: string | null) => void
    onChangeImage: (e: React.ChangeEvent<HTMLInputElement>) => void
    onReset: () => void
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
    imageUrl,
    components,
    onUpdateComponent,
    isDetecting,
    hoveredComponentId,
    selectedComponentId,
    onSelectComponent,
    onChangeImage,
    onReset
}) => {
    return (
        <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="h-full p-4 flex flex-col bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2 className="text-lg font-semibold text-black">Detection Playground</h2>
                    <div className="flex gap-2">
                        <label htmlFor="file-reupload">
                            <span className="inline-flex items-center px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                                Change Image
                            </span>
                            <input
                                id="file-reupload"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={onChangeImage}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={onReset}
                            className="inline-flex items-center px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            Back
                        </button>

                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <DrawingCanvas
                        imageUrl={imageUrl}
                        components={components}
                        onUpdateComponent={onUpdateComponent}
                        isDetecting={isDetecting}
                        hoveredComponentId={hoveredComponentId}
                        selectedComponentId={selectedComponentId}
                        onSelectComponent={onSelectComponent}
                    />
                </div>
            </div>
        </div>
    )
}

export default CanvasArea
