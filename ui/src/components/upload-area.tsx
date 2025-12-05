"use client"

import React, { useCallback, useState } from "react"
import { Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadAreaProps {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setIsDragging(false)
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0]
                const event = {
                    target: { files: [file] },
                } as unknown as React.ChangeEvent<HTMLInputElement>
                onFileUpload(event)
            }
        },
        [onFileUpload]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        onDropAccepted: () => setIsDragging(false),
        onDropRejected: () => setIsDragging(false),
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"],
            "application/pdf": [".pdf"],
        },
        multiple: false,
        noClick: true,        // để không mở file dialog khi click vào vùng drop
        noKeyboard: true,
    })

    return (
        <div className="h-full flex items-center justify-center">
            {/* Vùng kéo thả bao toàn bộ */}
            <div
                {...getRootProps()}
                className={`relative p-12 border-2 border-dashed rounded-lg transition-all duration-300 max-w-2xl w-full
          ${isDragActive || isDragging
                        ? "border-blue-500 bg-blue-50/50 shadow-2xl scale-105"
                        : "border-gray-300 bg-white hover:border-gray-500"
                    }`}
                onClick={(e) => e.stopPropagation()} // ngăn click vào vùng drop mở file dialog
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center gap-6 pointer-events-none">
                    {/* Icon động khi drag */}
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
            ${isDragActive || isDragging ? "bg-blue-100 scale-125" : "bg-gray-100"}`}
                    >
                        <Upload className={`w-12 h-12 transition-all duration-300
              ${isDragActive || isDragging ? "text-blue-600 animate-bounce" : "text-black"}`}
                        />
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className={`text-2xl font-bold transition-all
    ${isDragActive || isDragging ? "text-blue-600" : "text-black"}`}
                        >
                            {isDragActive || isDragging
                                ? "Drop it here!"
                                : "Upload Technical Drawing"
                            }
                        </h2>
                        <p className={`text-lg transition-all
    ${isDragActive || isDragging ? "text-blue-500" : "text-gray-600"}`}
                        >
                            {isDragActive || isDragging
                                ? "Release to start processing..."
                                : "Supports PNG, JPG, JPEG and PDF files"
                            }
                        </p>
                    </div>

                    <label htmlFor="file-upload" className="pointer-events-auto">
                        <span className={`inline-flex items-center px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg
              ${isDragActive || isDragging
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-900 text-white hover:bg-gray-800"
                            } cursor-pointer`}
                        >
                            <Upload className="w-6 h-6 mr-3" />
                            Choose File
                        </span>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={onFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Hiệu ứng overlay khi drag */}
                {(isDragActive || isDragging) && (
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none" />
                )}
            </div>
        </div>
    )
}

export default UploadArea