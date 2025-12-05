"use client"
import { OcrItem } from "@/app/page"
interface OcrTableProps {
    data: OcrItem[]
}

export default function OcrTable({ data }: OcrTableProps) {
    return (
        <div className="p-6 overflow-auto h-full">
            <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2">Code</th>
                        <th className="border border-gray-300 px-3 py-2">Description</th>
                        <th className="border border-gray-300 px-3 py-2">Count</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={item.code}
                            className="hover:bg-gray-50 cursor-pointer"
                        >
                            <td className="border border-gray-300 px-3 py-2 font-mono">{item.code}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">{item.description || "-"}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">{item.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
