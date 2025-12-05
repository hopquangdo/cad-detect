// components/footer.tsx
import React from "react"
import { Download, FileUp, FileSpreadsheet } from "lucide-react"

interface FooterControlsProps {
    componentsCount: number
    onDownloadExcel: () => void
}

const Footer: React.FC<FooterControlsProps> = ({ componentsCount, onDownloadExcel }) => {
    return (
        <footer className="border-t border-gray-200 bg-white shrink-0">
            <div className="px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {componentsCount} component{componentsCount !== 1 ? "s" : ""} x
                </div>
                <div className="flex gap-3">

                    <button
                        onClick={onDownloadExcel}
                        disabled={componentsCount === 0}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Download Excel
                    </button>
                </div>
            </div>
        </footer>
    )
}

export default Footer