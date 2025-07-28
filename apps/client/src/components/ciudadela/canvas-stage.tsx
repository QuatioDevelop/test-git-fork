'use client'

export default function CanvasStage() {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden relative">
      {/* Mockup ciudadela sin Konva */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-4 p-8">
        {/* Sala Video */}
        <div className="bg-green-500 text-white px-6 py-4 rounded-lg font-bold shadow-lg hover:bg-green-600 transition-colors cursor-pointer">
          Sala Video
        </div>
        
        {/* Galería 360° */}
        <div className="bg-orange-500 text-white px-6 py-4 rounded-lg font-bold shadow-lg hover:bg-orange-600 transition-colors cursor-pointer">
          Galería 360°
        </div>
        
        {/* Chat Live */}
        <div className="bg-purple-500 text-white px-6 py-4 rounded-lg font-bold shadow-lg hover:bg-purple-600 transition-colors cursor-pointer">
          Chat Live
        </div>
        
        {/* Plaza Central */}
        <div className="bg-red-500 text-white px-8 py-6 rounded-lg font-bold text-lg shadow-lg hover:bg-red-600 transition-colors cursor-pointer">
          Plaza Central
        </div>
      </div>
      
      {/* Welcome text */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white text-sm opacity-75">
          ¡Bienvenido a la Ciudadela Virtual de SURA Esencia Fest 2025!
        </p>
      </div>
    </div>
  )
}