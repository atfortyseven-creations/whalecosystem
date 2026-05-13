/**
 * 🆔 HUMANID BRAND IDENTITY ENGINE
 * Centrally manages the official HumanID Protocol logo visualization.
 */
export function HumanIDLogo({ 
    className = "w-10 h-10", 
    priority = true 
}: { className?: string; priority?: boolean }) {
    // Reference the institutional logo
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <Image
                src="/humanid_protocol_logo_1778714491433.png"
                alt="HumanID Protocol"
                fill
                className="object-contain transition-all duration-300 transform-gpu"
                priority={priority}
                unoptimized
            />
        </div>
    );
}
