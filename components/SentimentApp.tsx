"use client";

import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://market-sentiment-api.onrender.com";

const SAMPLE_HEADLINES = [
  "Fed signals pause on rate hikes as inflation cools toward 2% target",
  "JPMorgan beats Q3 earnings estimates, raises full-year guidance",
  "China manufacturing PMI contracts for third consecutive month",
  "Apple unveils AI-powered iPhone lineup, shares surge 4%",
  "Oil prices tumble on demand fears amid global slowdown concerns",
  "ECB raises rates again citing persistent core inflation pressures",
  "Goldman Sachs warns of rising credit default risks in commercial real estate",
  "Strong jobs report lifts market sentiment, Dow gains 350 points",
];

type HeadlineResult = {
  headline: string;
  label: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  score: number;
};

type SentimentResponse = {
  results: HeadlineResult[];
  aggregate_score: number;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  bullish_pct: number;
  bearish_pct: number;
  neutral_pct: number;
};

const SIGNAL_COLORS: Record<string, string> = {
  BULLISH: "#22c55e",
  BEARISH: "#ef4444",
  NEUTRAL: "#94a3b8",
};

const SIGNAL_BG: Record<string, string> = {
  BULLISH: "rgba(34,197,94,0.12)",
  BEARISH: "rgba(239,68,68,0.12)",
  NEUTRAL: "rgba(148,163,184,0.12)",
};

function GaugeChart({ score }: { score: number }) {
  // score is -1 to +1, map to 0-100
  const pct = Math.round(((score + 1) / 2) * 100);
  const color =
    score > 0.15 ? "#22c55e" : score < -0.15 ? "#ef4444" : "#94a3b8";

  const data = [{ value: pct, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 160, height: 90 }}>
        <RadialBarChart
          width={160}
          height={100}
          cx={80}
          cy={90}
          innerRadius={55}
          outerRadius={75}
          startAngle={180}
          endAngle={0}
          data={data}
          barSize={12}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "#1e2a3a" }}
            dataKey="value"
            cornerRadius={6}
            angleAxisId={0}
          />
        </RadialBarChart>
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-1"
          style={{ top: 30 }}
        >
          <span className="text-2xl font-bold" style={{ color }}>
            {score > 0 ? "+" : ""}
            {score.toFixed(2)}
          </span>
          <span className="text-xs" style={{ color: "#64748b" }}>
            aggregate score
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SentimentApp() {
  const [text, setText] = useState(SAMPLE_HEADLINES.join("\n"));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    const headlines = text
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    if (!headlines.length) return;
    if (headlines.length > 20) {
      setError("Maximum 20 headlines per request.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlines }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: resp.statusText }));
        throw new Error(err.detail || "API error");
      }

      const data: SentimentResponse = await resp.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [text]);

  const distributionData = result
    ? [
        { name: "Bullish", value: result.bullish_pct, fill: "#22c55e" },
        { name: "Neutral", value: result.neutral_pct, fill: "#94a3b8" },
        { name: "Bearish", value: result.bearish_pct, fill: "#ef4444" },
      ]
    : [];

  const confidenceData = result
    ? result.results.map((r, i) => ({
        name: `H${i + 1}`,
        confidence: Math.round(r.confidence * 100),
        fill: SIGNAL_COLORS[r.label],
      }))
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#e2e8f0",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #1e2a3a",
          padding: "24px 32px 20px",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.3px",
            margin: 0,
          }}
        >
          Market Sentiment Intelligence
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0 0" }}>
          FinBERT NLP · Financial news classification · Real-time signal
          generation
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {["FinBERT", "HuggingFace Inference API", "NLP", "Sentiment Analysis", "Trading Signals"].map(
            (tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "#1e2a3a",
                  color: "#94a3b8",
                  border: "1px solid #263345",
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 48px" }}>
        {/* Input */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1e2a3a",
            borderRadius: 10,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <label
              style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}
            >
              FINANCIAL HEADLINES
              <span
                style={{
                  marginLeft: 8,
                  fontWeight: 400,
                  color: "#475569",
                  fontSize: 12,
                }}
              >
                one per line · max 20
              </span>
            </label>
            <button
              onClick={() => setText(SAMPLE_HEADLINES.join("\n"))}
              style={{
                fontSize: 12,
                color: "#3b82f6",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              load samples
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            style={{
              width: "100%",
              background: "#0b1220",
              border: "1px solid #1e2a3a",
              borderRadius: 6,
              padding: "10px 12px",
              color: "#e2e8f0",
              fontSize: 13,
              lineHeight: 1.7,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            placeholder="Paste financial headlines here, one per line..."
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <span style={{ fontSize: 12, color: "#475569" }}>
              {text.split("\n").filter((l) => l.trim()).length} headlines
            </span>
            <button
              onClick={analyze}
              disabled={loading}
              style={{
                background: loading ? "#1e2a3a" : "#2563eb",
                color: loading ? "#64748b" : "#fff",
                border: "none",
                borderRadius: 6,
                padding: "9px 24px",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Analyzing…" : "Analyze with FinBERT"}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#f87171",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#475569",
              fontSize: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #1e2a3a",
                borderTopColor: "#2563eb",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Running FinBERT inference via HuggingFace API…
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {result && (
          <>
            {/* Signal Banner */}
            <div
              style={{
                background: SIGNAL_BG[result.signal],
                border: `1px solid ${SIGNAL_COLORS[result.signal]}40`,
                borderRadius: 10,
                padding: "20px 24px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                  TRADING SIGNAL
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: SIGNAL_COLORS[result.signal],
                    letterSpacing: 2,
                  }}
                >
                  {result.signal}
                </div>
              </div>
              <GaugeChart score={result.aggregate_score} />
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <Stat
                  label="Bullish"
                  value={`${result.bullish_pct}%`}
                  color="#22c55e"
                />
                <Stat
                  label="Bearish"
                  value={`${result.bearish_pct}%`}
                  color="#ef4444"
                />
                <Stat
                  label="Neutral"
                  value={`${result.neutral_pct}%`}
                  color="#94a3b8"
                />
                <Stat
                  label="Headlines"
                  value={`${result.results.length}`}
                  color="#60a5fa"
                />
              </div>
            </div>

            {/* Charts row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 24,
              }}
            >
              <ChartCard title="Sentiment Distribution">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={distributionData}
                    margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111827",
                        border: "1px solid #1e2a3a",
                        borderRadius: 6,
                      }}
                      formatter={(v) => [`${v}%`, "Share"]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {distributionData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Confidence per Headline">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={confidenceData}
                    margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111827",
                        border: "1px solid #1e2a3a",
                        borderRadius: 6,
                      }}
                      formatter={(v) => [`${v}%`, "Confidence"]}
                    />
                    <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                      {confidenceData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Results table */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1e2a3a",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #1e2a3a",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  letterSpacing: 1,
                }}
              >
                HEADLINE BREAKDOWN
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: "#0f1923" }}>
                    <th
                      style={{
                        padding: "10px 20px",
                        textAlign: "left",
                        color: "#475569",
                        fontWeight: 500,
                        width: "55%",
                      }}
                    >
                      Headline
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "center",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Signal
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Confidence
                    </th>
                    <th
                      style={{
                        padding: "10px 20px",
                        textAlign: "right",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderTop: "1px solid #1e2a3a",
                        background: i % 2 === 0 ? "transparent" : "#0d1a27",
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 20px",
                          color: "#cbd5e1",
                          lineHeight: 1.5,
                        }}
                      >
                        {r.headline}
                      </td>
                      <td style={{ padding: "11px 12px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: SIGNAL_COLORS[r.label],
                            background: `${SIGNAL_COLORS[r.label]}18`,
                            padding: "2px 8px",
                            borderRadius: 4,
                            letterSpacing: 0.5,
                          }}
                        >
                          {r.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "11px 12px",
                          textAlign: "right",
                          color: "#94a3b8",
                        }}
                      >
                        {(r.confidence * 100).toFixed(1)}%
                      </td>
                      <td
                        style={{
                          padding: "11px 20px",
                          textAlign: "right",
                          color:
                            r.score > 0
                              ? "#22c55e"
                              : r.score < 0
                              ? "#ef4444"
                              : "#94a3b8",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {r.score > 0 ? "+" : ""}
                        {r.score.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #1e2a3a",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <span style={{ fontWeight: 600, color: "#94a3b8", fontSize: 13 }}>
            Muhammed Adediran
          </span>
          <span style={{ color: "#475569", fontSize: 12, marginLeft: 8 }}>
            Quantitative AI Engineer & Financial Data Scientist
          </span>
        </div>
        <a
          href="https://adediran.xyz/contact"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: "#60a5fa",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Get in touch →
        </a>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{ minWidth: 60 }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e2a3a",
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#64748b",
          letterSpacing: 1,
          marginBottom: 14,
        }}
      >
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
