import { InstitutionalPortfolioView } from '@/components/bsv/InstitutionalPortfolioView';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LegendaryLoader title="Institutional Substrate" subtitle="Initializing Legendary Deck v4..." />;
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full overflow-hidden bg-[#050505]">
      <InstitutionalPortfolioView />
    </div>
  );
}
