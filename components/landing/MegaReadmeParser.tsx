import React from 'react';

export const MegaReadmeParser = ({ content }: { content: string }) => {
  const blocks = content.split('\n\n').filter(b => b.trim() !== '');

  return (
    <div className="w-full text-left space-y-6 md:space-y-8 mt-12 font-mono text-xs md:text-sm text-black/80">
      {blocks.map((block, idx) => {
        if (block.startsWith('## ')) {
          return <h2 key={idx} className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black py-4 border-b-4 border-black/20 mt-12 mb-6 leading-tight">{block.replace('## ', '')}</h2>;
        }
        if (block.startsWith('### ')) {
          return <h3 key={idx} className="text-xl md:text-2xl font-bold uppercase tracking-tight text-black border-l-4 border-black pl-4 my-6">{block.replace('### ', '')}</h3>;
        }
        if (block.startsWith('**') && block.endsWith('**')) {
           return <div key={idx} className="bg-black text-white p-6 font-bold uppercase tracking-widest my-8 text-center">{block.replace(/\*\*/g, '')}</div>;
        }
        if (block.match(/^[0-9]+\./)) {
           return <p key={idx} className="font-bold border border-black/10 p-4 bg-gray-50">{block}</p>;
        }
        return (
          <p key={idx} className="leading-relaxed text-justify opacity-90 px-4 md:px-0">
            {block}
          </p>
        );
      })}
    </div>
  );
};
