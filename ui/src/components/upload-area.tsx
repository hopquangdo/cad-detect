"use client"

import React from "react"
import { Upload } from "lucide-react"

interface UploadAreaProps {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload }) => {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="p-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition-colors bg-white max-w-2xl w-full">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-black" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-black mb-2">Upload Technical Drawing</h2>
                        <p className="text-gray-600 mb-4">Support for PNG, JPG, PDF formats</p>
                    </div>
                    <label htmlFor="file-upload">
                        <span className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg font-medium cursor-pointer hover:bg-gray-800 transition-colors">
                            Choose File
                        </span>
                        <input id="file-upload" type="file" accept="image/*,.pdf" onChange={onFileUpload} className="hidden" />
                    </label>
                </div>
            </div>
        </div>
    )
}

export default UploadArea
