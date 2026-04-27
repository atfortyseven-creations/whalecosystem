"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Globe, Clock, Share2, Download,
  BookOpen, ChevronRight, ExternalLink, AlertTriangle
} from 'lucide-react';
import { useNewsStore, NewsArticle } from '@/lib/store/news-store';
import Link from 'next/link';

// ── Proxy image helper ─────────────────────────────────────────────────────────
const FALLBACK_BGS = Array.from({ length: 10 }, (_, i) => `/api/proxy-image?seed=${i + 1}`);

function getArticleImage(article: NewsArticle): string {
  if (article.imageUrl && article.imageUrl.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(article.imageUrl)}`;
  }
  let hash = 0;
  for (let i = 0; i < article.id.length; i++) {
    hash = article.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_BGS[Math.abs(hash) % FALLBACK_BGS.length];
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
}

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
}

// ── Article renderer ───────────────────────────────────────────────────────────
function renderBody(description: string) {
  if (!description) return null;

  // Split on double newlines → paragraphs
  const rawParagraphs = description.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  return rawParagraphs.map((para, i) => {
    // Treat lines starting with ## as sub-headings
    if (para.startsWith('## ')) {
      return (
        <h2 key={i} className="full-report-subheading">
          {para.replace(/^##\s+/, '')}
        </h2>
      );
    }
    // Treat lines starting with # as section titles
    if (para.startsWith('# ')) {
      return (
        <h3 key={i} className="full-report-section-title">
          {para.replace(/^#\s+/, '')}
        </h3>
      );
    }
    // Blockquotes
    if (para.startsWith('> ')) {
      return (
        <blockquote key={i} className="full-report-blockquote">
          {para.replace(/^>\s+/, '')}
        </blockquote>
      );
    }
    // Treat lines starting with - or • as bullet points
    if (/^[-•]\s/.test(para)) {
      const items = para.split('\n').map(l => l.replace(/^[-•]\s+/, '').trim()).filter(Boolean);
      return (
        <ul key={i} className="full-report-list">
          {items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    }
    // Regular paragraph — first paragraph gets drop-cap treatment
    return (
      <p key={i} className={i === 0 ? 'full-report-lead' : 'full-report-body'}>
        {para}
      </p>
    );
  });
}

// ── Intelligence Generator (Deterministic) ──────────────────────────────────
function getIntelligenceBrief(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash);
  
  const impactScore = 70 + (h % 29);
  const sentiments = ["Bearish", "Neutral", "Bullish", "Highly Bullish", "Severe Risk"];
  const sentiment = sentiments[h % sentiments.length];
  const relevance = ["Tier 1 Institutional", "Macroeconomic", "Protocol Level", "Retail / Sentiment"];
  
  return {
    impact: impactScore,
    sentiment,
    relevance: relevance[h % relevance.length]
  };
}

// ── Inner content (uses useSearchParams) ──────────────────────────────────────
function FullReportContent() {
  const params = useSearchParams();
  const router = useRouter();
  const articleId = params.get('id');
  const { archive } = useNewsStore();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Resolve article from store or fetch from API
  useEffect(() => {
    if (!articleId) { setNotFound(true); return; }

    // Search across all archive dates
    for (const date of Object.keys(archive)) {
      const found = archive[date].find(a => a.id === articleId);
      if (found) {
        setArticle(found);
        // Build related articles (same date, different article)
        setAllArticles(archive[date].filter(a => a.id !== articleId).slice(0, 4));
        return;
      }
    }

    // Fallback: fetch fresh from API
    fetch('/api/news', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const items: NewsArticle[] = data.articles ?? [];
        const found = items.find(a => a.id === articleId);
        if (found) {
          setArticle(found);
          setAllArticles(items.filter(a => a.id !== articleId).slice(0, 4));
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [articleId, archive]);

  const readTime = article ? estimateReadTime(article.description ?? '') : 0;

  // ── Not found ──
  if (notFound) {
    return (
      <div className="full-report-not-found">
        <AlertTriangle size={36} strokeWidth={1.5} />
        <h1>Report Not Found</h1>
        <p>This article may have expired or the link is invalid.</p>
        <Link href="/news" className="full-report-back-btn">
          <ArrowLeft size={14} /> Return to News Terminal
        </Link>
      </div>
    );
  }

  // ── Loading ──
  if (!article) {
    return (
      <div className="full-report-loading">
        <div className="full-report-loader" />
        <p>Loading report…</p>
      </div>
    );
  }

  const imgSrc = imgError ? FALLBACK_BGS[0] : getArticleImage(article);

  return (
    <article className="full-report-article">

      {/* ── Navigation breadcrumb ── */}
      <nav className="full-report-breadcrumb">
        <Link href="/news" className="full-report-nav-link">
          <ArrowLeft size={13} />
          <span>News Terminal</span>
        </Link>
        <ChevronRight size={11} className="full-report-breadcrumb-sep" />
        <span className="full-report-breadcrumb-current">Full Report</span>
      </nav>

      {/* ── Category + Source ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="full-report-meta-top"
      >
        <span className="full-report-source-badge">
          <Globe size={10} />
          {article.source}
        </span>
        <span className="full-report-category">Analytical Report</span>
      </motion.div>

      {/* ── Hero Title ── */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="full-report-title"
      >
        {article.title}
      </motion.h1>

      {/* ── Meta strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="full-report-meta-strip"
      >
        <span className="full-report-meta-item">
          <Calendar size={11} />
          {formatFullDate(article.date)}
        </span>
        <span className="full-report-meta-divider" />
        <span className="full-report-meta-item">
          <Clock size={11} />
          {formatTime(article.date)}
        </span>
        <span className="full-report-meta-divider" />
        <span className="full-report-meta-item">
          <BookOpen size={11} />
          {readTime} min read
        </span>
        {article.url && article.url.startsWith('http') && (
          <>
            <span className="full-report-meta-divider" />
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="full-report-source-link"
            >
              <ExternalLink size={11} />
              Original Source
            </a>
          </>
        )}
      </motion.div>

      {/* ── Hero Image ── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="full-report-hero"
      >
        <img
          src={imgSrc}
          alt={article.title}
          className="full-report-hero-img"
          onError={() => setImgError(true)}
        />
        <div className="full-report-hero-overlay" />
      </motion.div>

      {/* ── Executive Intelligence Brief ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="full-report-intelligence"
      >
        <div className="full-report-intelligence-header">
          <AlertTriangle size={12} className="text-[#0044CC]" />
          <span>Executive Intelligence Brief</span>
        </div>
        <div className="full-report-intelligence-grid">
          {(() => {
            const brief = getIntelligenceBrief(article.id);
            return (
              <>
                <div className="full-report-intelligence-item">
                  <span className="label">Systemic Impact</span>
                  <span className="value text-[#0044CC]">{brief.impact} / 100</span>
                </div>
                <div className="full-report-intelligence-item">
                  <span className="label">Directional Sentiment</span>
                  <span className="value">{brief.sentiment}</span>
                </div>
                <div className="full-report-intelligence-item">
                  <span className="label">Classification</span>
                  <span className="value">{brief.relevance}</span>
                </div>
              </>
            );
          })()}
        </div>
      </motion.div>

      {/* ── Article Body ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25 }}
        className="full-report-content"
        lang="en"
      >
        {renderBody(article.description ?? '')}
      </motion.div>

      {/* ── Legal Disclaimer ── */}
      <div className="full-report-disclaimer">
        <div className="full-report-disclaimer-rule" />
        <div className="full-report-disclaimer-header">
          <span>Professional Analysis Report</span>
          <span>Strictly Educational Insights</span>
        </div>
        <p className="full-report-disclaimer-text">
          The analytical material provided herein is solely for educational and informational purposes
          and should not be construed as investment, financial, or legal advice. Trading and interacting
          with digital assets inherently involves substantial risk, including the possibility of full
          capital loss. All information reflects market conditions at the time of original publication.
          Past performance is not indicative of future results.
        </p>
      </div>

      {/* ── Related Articles ── */}
      {allArticles.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="full-report-related"
        >
          <h2 className="full-report-related-title">More from the Terminal</h2>
          <div className="full-report-related-grid">
            {allArticles.map(rel => (
              <Link
                key={rel.id}
                href={`/whalepost/full-report?id=${encodeURIComponent(rel.id)}`}
                className="full-report-related-card"
              >
                <div className="full-report-related-img-wrap">
                  <img
                    src={getArticleImage(rel)}
                    alt={rel.title}
                    className="full-report-related-img"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_BGS[0]; }}
                  />
                </div>
                <div className="full-report-related-body">
                  <span className="full-report-related-date">{formatFullDate(rel.date)}</span>
                  <p className="full-report-related-headline">{rel.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

    </article>
  );
}

// ── Page wrapper ───────────────────────────────────────────────────────────────
export default function FullReportPage() {
  return (
    <>
      <style>{`
        /* ── Full Report Design System ──────────────────────────────────── */
        :root {
          --fr-bg: #FAFAF8;
          --fr-ink: #0A0A0A;
          --fr-muted: rgba(10, 10, 10, 0.42);
          --fr-border: rgba(10, 10, 10, 0.07);
          --fr-accent: #0044CC;
          --fr-card: #FFFFFF;
          --fr-serif: 'Georgia', 'Times New Roman', serif;
          --fr-sans: 'Inter', system-ui, sans-serif;
          --fr-mono: 'IBM Plex Mono', 'Fira Mono', monospace;
          --fr-max: 780px;
          --fr-wide: 1100px;
        }

        .full-report-article {
          min-height: 100vh;
          background: var(--fr-bg);
          color: var(--fr-ink);
          padding-bottom: 8rem;
        }

        /* Breadcrumb */
        .full-report-breadcrumb {
          max-width: var(--fr-wide);
          margin: 0 auto;
          padding: 1.75rem 2rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .full-report-nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--fr-mono);
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--fr-muted);
          text-decoration: none;
          transition: color 0.15s;
        }
        .full-report-nav-link:hover { color: var(--fr-ink); }
        .full-report-breadcrumb-sep { color: var(--fr-border); flex-shrink: 0; }
        .full-report-breadcrumb-current {
          font-family: var(--fr-mono);
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--fr-ink);
        }

        /* Meta Top */
        .full-report-meta-top {
          max-width: var(--fr-max);
          margin: 2.5rem auto 0;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .full-report-source-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--fr-mono);
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--fr-accent);
          padding: 0.3rem 0.65rem;
          border: 1px solid rgba(0, 68, 204, 0.22);
          border-radius: 2px;
        }
        .full-report-category {
          font-family: var(--fr-mono);
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--fr-muted);
        }

        /* Title */
        .full-report-title {
          max-width: var(--fr-max);
          margin: 1.5rem auto 0;
          padding: 0 2rem;
          font-family: var(--fr-sans);
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--fr-ink);
          text-wrap: balance;
        }

        /* Meta Strip */
        .full-report-meta-strip {
          max-width: var(--fr-max);
          margin: 1.5rem auto 0;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--fr-border);
        }
        .full-report-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--fr-mono);
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--fr-muted);
        }
        .full-report-meta-divider {
          display: inline-block;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--fr-border);
          flex-shrink: 0;
        }
        .full-report-source-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-family: var(--fr-mono);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--fr-accent);
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .full-report-source-link:hover { opacity: 0.7; }

        /* Hero image — full container width, max capped */
        .full-report-hero {
          max-width: var(--fr-wide);
          margin: 2.5rem auto 0;
          padding: 0 2rem;
          position: relative;
          border-radius: 6px;
          overflow: hidden;
        }
        .full-report-hero-img {
          width: 100%;
          height: clamp(260px, 45vw, 560px);
          object-fit: cover;
          display: block;
          border-radius: 4px;
        }
        .full-report-hero-overlay {
          position: absolute;
          bottom: 0;
          left: 2rem;
          right: 2rem;
          height: 40%;
          background: linear-gradient(to top, rgba(250,250,248,0.7) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Body content */
        .full-report-content {
          max-width: var(--fr-max);
          margin: 3.5rem auto 0;
          padding: 0 2rem;
        }

        /* Lead paragraph — slightly larger, heavier */
        .full-report-lead {
          font-family: var(--fr-serif);
          font-size: clamp(1.05rem, 1.4vw, 1.2rem);
          font-weight: 400;
          line-height: 1.85;
          color: var(--fr-ink);
          margin-bottom: 1.75rem;
          letter-spacing: 0.01em;
        }

        /* Regular body paragraphs */
        .full-report-body {
          font-family: var(--fr-serif);
          font-size: clamp(1rem, 1.2vw, 1.075rem);
          font-weight: 400;
          line-height: 1.9;
          color: rgba(10, 10, 10, 0.88);
          margin-bottom: 1.6rem;
          letter-spacing: 0.008em;
        }

        /* Blockquotes */
        .full-report-blockquote {
          font-family: var(--fr-serif);
          font-size: clamp(1.1rem, 1.3vw, 1.25rem);
          font-style: italic;
          line-height: 1.8;
          color: var(--fr-ink);
          margin: 2.5rem 0;
          padding: 1.5rem 2rem;
          border-left: 4px solid var(--fr-accent);
          background: rgba(0, 68, 204, 0.02);
          border-radius: 0 4px 4px 0;
        }

        /* Sub-headings */
        .full-report-subheading {
          font-family: var(--fr-sans);
          font-size: clamp(1.05rem, 1.3vw, 1.2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.3;
          color: var(--fr-ink);
          margin-top: 2.75rem;
          margin-bottom: 1rem;
          padding-left: 0.75rem;
          border-left: 3px solid var(--fr-ink);
        }

        .full-report-section-title {
          font-family: var(--fr-mono);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--fr-muted);
          margin-top: 3rem;
          margin-bottom: 0.75rem;
        }

        /* Bullet list */
        .full-report-list {
          font-family: var(--fr-serif);
          font-size: clamp(1rem, 1.2vw, 1.075rem);
          line-height: 1.85;
          color: rgba(10, 10, 10, 0.88);
          margin-bottom: 1.6rem;
          padding-left: 1.5rem;
          list-style: none;
        }
        .full-report-list li {
          position: relative;
          padding-left: 1rem;
          margin-bottom: 0.6rem;
        }
        .full-report-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.7em;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--fr-muted);
        }

        /* Intelligence Brief */
        .full-report-intelligence {
          max-width: var(--fr-max);
          margin: 3.5rem auto 0;
          padding: 2rem;
          background: var(--fr-card);
          border: 1px solid var(--fr-border);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .full-report-intelligence-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--fr-mono);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--fr-ink);
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--fr-border);
        }
        .full-report-intelligence-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .full-report-intelligence-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .full-report-intelligence-item .label {
          font-family: var(--fr-mono);
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--fr-muted);
        }
        .full-report-intelligence-item .value {
          font-family: var(--fr-sans);
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--fr-ink);
        }

        /* Disclaimer */
        .full-report-disclaimer {
          max-width: var(--fr-max);
          margin: 5rem auto 0;
          padding: 0 2rem;
        }
        .full-report-disclaimer-rule {
          height: 1px;
          background: var(--fr-border);
          margin-bottom: 1.75rem;
        }
        .full-report-disclaimer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--fr-mono);
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--fr-muted);
          margin-bottom: 0.875rem;
        }
        .full-report-disclaimer-text {
          font-family: var(--fr-mono);
          font-size: 0.68rem;
          line-height: 1.75;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--fr-muted);
          opacity: 0.65;
        }

        /* Related articles */
        .full-report-related {
          max-width: var(--fr-wide);
          margin: 5rem auto 0;
          padding: 0 2rem;
        }
        .full-report-related-title {
          font-family: var(--fr-mono);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--fr-muted);
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--fr-border);
        }
        .full-report-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .full-report-related-card {
          display: block;
          text-decoration: none;
          border: 1px solid var(--fr-border);
          border-radius: 4px;
          overflow: hidden;
          background: var(--fr-card);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .full-report-related-card:hover {
          border-color: rgba(10, 10, 10, 0.2);
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
        }
        .full-report-related-img-wrap {
          width: 100%;
          height: 130px;
          overflow: hidden;
          background: #F0EFEC;
        }
        .full-report-related-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .full-report-related-card:hover .full-report-related-img { transform: scale(1.03); }
        .full-report-related-body {
          padding: 0.875rem 1rem;
        }
        .full-report-related-date {
          display: block;
          font-family: var(--fr-mono);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--fr-muted);
          margin-bottom: 0.4rem;
        }
        .full-report-related-headline {
          font-family: var(--fr-sans);
          font-size: 0.8rem;
          font-weight: 800;
          line-height: 1.35;
          color: var(--fr-ink);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Not found & loading */
        .full-report-not-found,
        .full-report-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-family: var(--fr-mono);
          color: rgba(10,10,10,0.45);
          text-align: center;
          padding: 4rem 2rem;
        }
        .full-report-not-found h1 {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #0A0A0A;
        }
        .full-report-not-found p {
          font-size: 0.75rem;
          letter-spacing: 0.06em;
        }
        .full-report-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0044CC;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .full-report-back-btn:hover { opacity: 0.7; }
        .full-report-loader {
          width: 28px;
          height: 28px;
          border: 2px solid rgba(10,10,10,0.1);
          border-top-color: #0A0A0A;
          border-radius: 50%;
          animation: fr-spin 0.75s linear infinite;
        }
        @keyframes fr-spin { to { transform: rotate(360deg); } }

        /* Responsive */
        @media (max-width: 640px) {
          .full-report-breadcrumb,
          .full-report-meta-top,
          .full-report-title,
          .full-report-meta-strip,
          .full-report-content,
          .full-report-disclaimer,
          .full-report-related { padding-left: 1.25rem; padding-right: 1.25rem; }
          .full-report-hero { padding-left: 0; padding-right: 0; border-radius: 0; }
          .full-report-hero-overlay { left: 0; right: 0; }
          .full-report-disclaimer-header { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
        }
      `}</style>

      <main style={{ background: '#FAFAF8', minHeight: '100vh' }}>
        <Suspense fallback={
          <div className="full-report-loading">
            <div className="full-report-loader" />
            <p>Loading report…</p>
          </div>
        }>
          <FullReportContent />
        </Suspense>
      </main>
    </>
  );
}
