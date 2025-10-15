export default function Header() {
    return (
        <header className="border-b border-gray-200 bg-white shrink-0">
            <div className="px-6 py-4 flex items-center gap-3">
                <img src="/logo.jpg" alt="RDSIC Logo" className="w-14 h-14 object-contain" />
                <div>
                    <h1 className="text-2xl font-bold text-black">
                        AI SPC IIC
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload your technical drawing to detect and annotate components
                    </p>
                </div>
            </div>
        </header>
    )
}
