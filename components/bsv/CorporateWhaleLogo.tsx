export function CorporateWhaleLogo({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]`}>
            <defs>
                <linearGradient id="whaleGoldHero" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DFBB5E" />
                    <stop offset="50%" stopColor="#FFF2CD" />
                    <stop offset="100%" stopColor="#C49B30" />
                </linearGradient>
            </defs>
            <path 
                d="M 20,40 Q 30,15 50,40 Q 70,65 85,35 L 80,75 Q 50,90 20,70 L 15,45 Q 15,40 20,40 Z" 
                fill="url(#whaleGoldHero)" 
            />
            <path d="M 50,40 L 60,65 L 75,45" fill="none" stroke="#C49B30" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
