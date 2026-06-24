"use client";
import Link from "next/link";

/**
 * Constraint Scheduler — landing page
 * ------------------------------------
 * Converted from static HTML. The dark mode toggle has been removed —
 * this renders as a fixed light theme, with no client-side state, so
 * it's a plain Server Component (no 'use client' needed).
 *
 * Save as app/page.tsx.
 * The "Go to schedule" link assumes a route at app/schedule/page.tsx —
 * update the href below if your route is named differently.
 */

export default function Home() {
  return (
    <>
      <div className="blob blob-a" aria-hidden="true" />
      <div className="blob blob-b" aria-hidden="true" />

      <header className="nav">
        <div className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="3"
                stroke="white"
                strokeWidth={2}
              />
              <path d="M3 9H21" stroke="white" strokeWidth={2} />
              <path
                d="M8 2V5"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M16 2V5"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </span>
          Constraint Scheduler
        </div>
      </header>

      <main>
        <div className="layout">
          <div className="copy">
            <p className="eyebrow">Constraint-based scheduling</p>
            <h1>
              <span>Build schedules</span>
              <span>that respect every constraint.</span>
            </h1>
            <p className="subtitle">
              Set the rules once — availability, dependencies, deadlines — and
              let the scheduler find a plan that actually fits.
            </p>
            <div className="cta">
              <Link className="" href="/scheduler">
                Go to schedule
              </Link>
            </div>
          </div>

          <div className="illustration">
            <svg
              viewBox="0 0 640 640"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Illustration of a calendar with connected, constraint-linked tasks"
            >
              <defs>
                <linearGradient id="calHeader" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--accent)" />
                  <stop offset="1" stopColor="var(--accent-2)" />
                </linearGradient>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--accent)" />
                  <stop offset="1" stopColor="var(--accent-2)" />
                </linearGradient>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)" />
                </marker>
              </defs>

              <rect
                x="186"
                y="50"
                width="16"
                height="54"
                rx="8"
                fill="var(--cal-ring)"
              />
              <rect
                x="438"
                y="50"
                width="16"
                height="54"
                rx="8"
                fill="var(--cal-ring)"
              />

              <rect
                x="60"
                y="80"
                width="520"
                height="480"
                rx="28"
                fill="var(--cal-body)"
              />
              <path
                d="M60,108 a28,28 0 0 1 28,-28 h464 a28,28 0 0 1 28,28 v62 h-520 z"
                fill="url(#calHeader)"
              />

              <rect
                x="84"
                y="188"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="178"
                y="188"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="272"
                y="188"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="366"
                y="188"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="460"
                y="188"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />

              <rect
                x="84"
                y="276"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="178"
                y="276"
                width="84"
                height="78"
                rx="12"
                fill="url(#taskGrad)"
              />
              <rect
                x="272"
                y="276"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="366"
                y="276"
                width="84"
                height="78"
                rx="12"
                fill="url(#taskGrad)"
              />
              <rect
                x="460"
                y="276"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />

              <rect
                x="84"
                y="364"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="178"
                y="364"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="272"
                y="364"
                width="84"
                height="78"
                rx="12"
                fill="url(#taskGrad)"
              />
              <rect
                x="366"
                y="364"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="460"
                y="364"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />

              <rect
                x="84"
                y="452"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="178"
                y="452"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="272"
                y="452"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="366"
                y="452"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />
              <rect
                x="460"
                y="452"
                width="84"
                height="78"
                rx="12"
                fill="var(--cal-cell)"
                stroke="var(--cal-cell-border)"
              />

              <path
                d="M220,315 Q314,255 408,315"
                fill="none"
                stroke="var(--accent)"
                strokeWidth={3}
                strokeDasharray="2 8"
                strokeLinecap="round"
                markerEnd="url(#arrow)"
              />
              <path
                d="M408,315 Q380,365 314,403"
                fill="none"
                stroke="var(--accent)"
                strokeWidth={3}
                strokeDasharray="2 8"
                strokeLinecap="round"
                markerEnd="url(#arrow)"
              />

              <g transform="translate(298,222)">
                <rect
                  x="0"
                  y="10"
                  width="32"
                  height="24"
                  rx="6"
                  fill="var(--cal-body)"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                />
                <path
                  d="M6,10 v-6 a10,10 0 0 1 20,0 v6"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                />
                <circle cx="16" cy="22" r="3" fill="var(--accent)" />
              </g>
            </svg>
          </div>
        </div>
      </main>

      <style jsx>{`
        :global(:root) {
          --bg: #f4f9ff;
          --blob-1: #bfe3ff;
          --blob-2: #8fcbff;
          --surface: rgba(255, 255, 255, 0.62);
          --surface-border: rgba(255, 255, 255, 0.85);
          --surface-shadow: rgba(20, 60, 110, 0.16);
          --text-primary: #1b1a19;
          --text-secondary: #51596a;
          --accent: #0078d4;
          --accent-2: #3fa9ff;
          --accent-soft: rgba(0, 120, 212, 0.18);
          --cal-body: #ffffff;
          --cal-ring: #bfd9ef;
          --cal-cell: #eff6fc;
          --cal-cell-border: #d7e7f5;
          --cal-shadow: rgba(20, 70, 130, 0.2);
          --focus-ring: #0078d4;
          color-scheme: light;
        }

        :global(*) {
          box-sizing: border-box;
        }

        :global(html),
        :global(body) {
          margin: 0;
          padding: 0;
        }

        :global(body) {
          min-height: 100vh;
          font-family:
            "Segoe UI Variable Text",
            "Segoe UI",
            -apple-system,
            BlinkMacSystemFont,
            "Helvetica Neue",
            Arial,
            sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          overflow-x: hidden;
          position: relative;
        }

        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }
        .blob-a {
          width: 480px;
          height: 480px;
          background: var(--blob-1);
          top: -160px;
          left: -140px;
        }
        .blob-b {
          width: 420px;
          height: 420px;
          background: var(--blob-2);
          bottom: -180px;
          right: -120px;
        }

        @media (prefers-reduced-motion: no-preference) {
          .blob-a {
            animation: float-a 22s ease-in-out infinite;
          }
          .blob-b {
            animation: float-b 26s ease-in-out infinite;
          }
        }
        @keyframes float-a {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(40px, 30px);
          }
        }
        @keyframes float-b {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-30px, -40px);
          }
        }

        .nav {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 48px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.01em;
        }
        .brand-mark {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px var(--accent-soft);
          flex-shrink: 0;
        }
        .brand-mark svg {
          width: 16px;
          height: 16px;
        }

        main {
          position: relative;
          z-index: 2;
          min-height: calc(100vh - 86px);
          display: flex;
          align-items: center;
          padding: 0 48px 64px;
        }
        .layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          gap: 40px;
        }

        .copy {
          max-width: 560px;
        }
        .eyebrow {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin: 0 0 18px;
        }
        h1 {
          font-family:
            "Segoe UI Variable Display",
            "Segoe UI",
            -apple-system,
            sans-serif;
          font-size: clamp(38px, 5.6vw, 68px);
          font-weight: 600;
          line-height: 1.06;
          letter-spacing: -0.02em;
          margin: 0 0 22px;
          color: var(--text-primary);
        }
        h1 span {
          display: block;
        }
        .subtitle {
          font-size: clamp(16px, 1.6vw, 19px);
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0 0 36px;
          max-width: 460px;
        }

        .cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          border: none;
          border-radius: 8px;
          padding: 14px 26px;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 10px 24px var(--accent-soft);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }
        .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px var(--accent-soft);
        }
        .cta:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 3px;
        }
        .cta svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }
        .cta:hover svg {
          transform: translateX(3px);
        }

        .illustration {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .illustration svg {
          width: 100%;
          max-width: 480px;
          height: auto;
          filter: drop-shadow(0 24px 48px var(--cal-shadow));
        }

        @media (max-width: 920px) {
          .nav {
            padding: 22px 24px;
          }
          main {
            padding: 0 24px 48px;
          }
          .layout {
            flex-direction: column-reverse;
            text-align: center;
            gap: 28px;
          }
          .copy {
            max-width: 100%;
          }
          .subtitle {
            margin-left: auto;
            margin-right: auto;
          }
          .illustration svg {
            max-width: 320px;
            opacity: 0.85;
          }
        }
      `}</style>
    </>
  );
}
