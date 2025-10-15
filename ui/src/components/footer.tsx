import React from "react"
import { Download, FileUp } from "lucide-react"

interface FooterControlsProps {
    componentsCount: number
}

const Footer: React.FC<FooterControlsProps> = ({ componentsCount }) => {
    return (
        <footer className="border-t border-gray-200 bg-white shrink-0">
            <div className="px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {componentsCount} component{componentsCount !== 1 ? "s" : ""} x
                </div>
                <div className="flex gap-2">
                    <label htmlFor="json-upload">
                        <span className="inline-flex items-center px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                            <FileUp className="w-4 h-4 mr-2" />
                            Upload JSON
                        </span>
                        <input id="json-upload" type="file" accept=".json" className="hidden" />
                    </label>
                    <button
                        disabled={componentsCount === 0}
                        className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download JSON
                    </button>
                </div>
            </div>
        </footer>
    )
}

export default Footer
