import Image from 'next/image';

export function CorporateWhaleLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`${className} relative`}>
            <Image
                src="/logo-landingpage.png"
                alt="Whale Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
