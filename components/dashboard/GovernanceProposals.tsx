import { useState } from 'react';
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit';
import { Vote, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';
import useSWR from 'swr';
import { ChronosLens } from '@/components/oracle/ChronosLens';
import { useFactCheck } from '@/hooks/useFactCheck';


interface Proposal {
    id: string;
    question: string;
    description: string;
    outcomes: string[];
    category: string;
    creatorAddress: string;
    votes?: number;
    createdAt?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function GovernanceProposals() {
    const { isAuthenticated } = useAuth();
    const { address } = useAccount();
    const { data: proposals, isLoading, mutate } = useSWR<Proposal[]>('/api/governance/proposals', fetcher, {
        refreshInterval: 10000 
    });

    const [votingProposal, setVotingProposal] = useState<string | null>(null);

    const handleVote = async (proposalId: string, outcomeIndex: number, proof: ISuccessResult) => {
        setVotingProposal(proposalId);

        if (!address) {
            toast.error('Connect your wallet first');
            setVotingProposal(null);
            return;
        }

        try {
            const vote = outcomeIndex === 0 ? 'FOR' : 'AGAINST';

            const res = await fetch('/api/governance/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    vote,
                    voterAddress: address,
                    worldIdProof: {
                        merkle_root: proof.merkle_root,
                        nullifier_hash: proof.nullifier_hash,
                        proof: proof.proof,
                        verification_level: proof.verification_level,
                    },
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Failed to vote');
            }

            toast.success(`Vote registered: ${vote}!`);
            mutate();
        } catch (error: any) {
            console.error('Error voting:', error);
            toast.error(error.message || 'Error while voting');
        } finally {
            setVotingProposal(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (!proposals || proposals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Vote className="w-12 h-12 text-zinc-600 mb-4" />
                <p className="text-sm text-zinc-500">
                    No active polls.
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                    Click on Governance to create the first one.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-sm font-black text-[#050505] uppercase tracking-widest flex items-center gap-2">
                        <Vote size={18} className="text-[#00C076]" />
                        Active Network Proposals
                    </h2>
                    <p className="text-[10px] text-[#888888] mt-1">
                        Cryptographically verifiable governance. One Human = One Vote.
                    </p>
                </div>
                <div className="px-3 py-1.5 border border-[#E5E5E5] rounded-lg bg-white shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-[#050505] tracking-widest">
                        {proposals.length} Active
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {proposals.map((proposal) => (
                    <div key={proposal.id} className="bg-white border border-[#E5E5E5] hover:border-[#050505]/20 rounded-2xl p-6 shadow-sm transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00C076]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full z-0" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[8px] px-2 py-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded-md font-black uppercase tracking-widest text-[#888888]">
                                    {proposal.category.toUpperCase()}
                                </span>
                                <span className="text-[10px] font-mono text-[#888888]">
                                    {proposal.votes || 0} Votes Cast
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-[#050505] mb-2">{proposal.question}</h3>
                            <p className="text-xs text-[#888888] mb-6 leading-relaxed line-clamp-2">
                                {proposal.description}
                            </p>

                            <div className="flex gap-3">
                                {proposal.outcomes.map((outcome, idx) => (
                                    <div key={idx} className="flex-1">
                                        {votingProposal === proposal.id ? (
                                            <IDKitWidget
                                                app_id="app_ea6e54f0a2ba18bc8edba458a2d3c52d"
                                                action={proposal.id}
                                                verification_level={VerificationLevel.Orb}
                                                onSuccess={(proof: ISuccessResult) => handleVote(proposal.id, idx, proof)}
                                            >
                                                {({ open }: { open: () => void }) => (
                                                    <button
                                                        onClick={open}
                                                        className={`w-full py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all
                                                            ${idx === 0 
                                                                ? 'bg-[#00C076]/10 border-[#00C076]/30 text-[#00C076] hover:bg-[#00C076] hover:text-white' 
                                                                : 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white'
                                                            }`}
                                                    >
                                                        Verify to Vote {outcome}
                                                    </button>
                                                )}
                                            </IDKitWidget>
                                        ) : (
                                            <button
                                                onClick={() => setVotingProposal(proposal.id)}
                                                className={`w-full py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all
                                                    ${idx === 0 
                                                        ? 'bg-white border-[#E5E5E5] text-[#050505] hover:border-[#00C076] hover:text-[#00C076]' 
                                                        : 'bg-white border-[#E5E5E5] text-[#050505] hover:border-[#FF3B30] hover:text-[#FF3B30]'
                                                    }`}
                                            >
                                                {outcome}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
