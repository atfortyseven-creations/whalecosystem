import Image from 'next/image';

export function CorporateWhaleLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`${className} relative`}>
            <Image
                src="/official-whale-monochrome.png"
                alt="Whale Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
