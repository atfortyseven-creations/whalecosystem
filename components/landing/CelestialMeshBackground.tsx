export function CelestialMeshBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#FAF9F6] dark:bg-[#050810] transform-gpu pointer-events-none">
      {/* Layer 1: Institutional Blue Blocks (Subtle Pattern) */}
      <div 
        className="absolute inset-0 opacity-[0.06] mix-blend-screen bg-repeat z-[0]"
        style={{ 
          backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
          backgroundSize: '400px auto'
        }}
      />

      {/* High-Performance 240Hz Image Layout without WebKit jank */}
      <img
        src="/api/checkpoint-image?name=olas-hokusai-4k.png"
        alt="Hokusai Waves"
        className="absolute bottom-0 left-0 w-full h-auto object-cover opacity-90 z-[1]"
        style={{
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        fetchPriority="high"
      />
      {/* Dark mode overlay */}
      <div 
        className="absolute inset-0 z-[2] hidden dark:block" 
        style={{ 
          background: "linear-gradient(to top, #050810 0%, transparent 60%)", 
          opacity: 0.9 
        }} 
      />
      
      {/* Vignette effect for focus */}
      <div className="absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(250,249,246,0.3)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,8,16,0.8)_100%)]" />
    </div>
  );
}
