import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { QuickHelpChatPanel } from "../components/QuickHelpChatPanel";
import { aiApi } from "@/services/aiApi";
import {
  Sparkles,
  IndianRupee,
  Smile,
  AlertTriangle,
  Lightbulb,
  Users,
  Zap,
  Brain,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

type AnalyzeResult = {
  success?: boolean;
  problem?: string;
  category?: string;
  confidence?: number;
  predicted_price?: number;
  pricing?: { estimated_price?: number; price_range?: { low?: number; high?: number } };
  sentiment?: {
    overall?: string;
    scores?: Record<string, number>;
    confidence?: number;
  };
  urgency?: { is_urgent?: boolean; level?: string; matched_keywords?: string[] };
  suggestion?: string;
  explanation?: string;
  top_helpers?: Array<{
    id?: number;
    name?: string;
    role?: string;
    rating?: number;
    distance_km?: number;
    experience_years?: number;
    score?: number;
    availability?: boolean;
  }>;
  emergency?: { severity_level?: string; is_emergency?: boolean };
};

function confidenceLabel(c: number | undefined) {
  if (c == null) return "—";
  if (c >= 80) return "High";
  if (c >= 55) return "Medium";
  return "Low";
}

export function AIDiagnosisPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState("");

  const runAnalysis = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await aiApi.analyzeAll(text.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze issue");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const conf = result?.confidence ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm mb-4">
            <Brain className="w-3.5 h-3.5 text-primary" />
            QuickHelp AI · Smart Service Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            Describe your problem
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            One analysis runs classification, pricing, sentiment, urgency, and ranked helpers — like a
            real product pipeline.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-xl shadow-lg border-border/80 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Issue input
                </CardTitle>
                <CardDescription>Be specific — mention symptoms, urgency, and location hints.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe your problem — e.g. My AC is not cooling and makes a loud noise at night."
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background p-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[140px]"
                />
                <button
                  type="button"
                  onClick={() => void runAnalysis()}
                  disabled={loading || !text.trim()}
                  className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground px-8 py-3 font-medium shadow-lg hover:bg-primary/90 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  {loading ? "Analyzing…" : "Analyze with AI"}
                </button>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-md">
                {error}
              </div>
            )}

            {result && result.success !== false && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Analysis results
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Service category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">{result.category ?? "—"}</p>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Model confidence</span>
                          <span>
                            {conf.toFixed(1)}% · {confidenceLabel(conf)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, conf))}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        Predicted price
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">
                        ₹{result.predicted_price ?? result.pricing?.estimated_price ?? "—"}
                      </p>
                      {result.pricing?.price_range && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Range: ₹{result.pricing.price_range.low} – ₹{result.pricing.price_range.high}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Smile className="w-4 h-4" />
                        Sentiment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-semibold capitalize text-foreground">
                        {result.sentiment?.overall ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tone confidence: {result.sentiment?.confidence?.toFixed(1) ?? "—"}%
                      </p>
                      {result.sentiment?.scores && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(result.sentiment.scores).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] uppercase tracking-wide rounded-md bg-muted px-2 py-0.5 text-muted-foreground"
                            >
                              {k}: {v.toFixed(0)}%
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card
                    className={`rounded-xl shadow-lg hover:shadow-xl transition-shadow ${
                      result.urgency?.is_urgent ? "border-amber-500/40 bg-amber-500/5" : ""
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Urgency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-semibold capitalize">
                        {result.urgency?.level ?? "normal"}
                      </p>
                      {result.urgency?.matched_keywords && result.urgency.matched_keywords.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Keywords: {result.urgency.matched_keywords.join(", ")}
                        </p>
                      )}
                      {result.emergency?.severity_level === "HIGH" && (
                        <p className="text-xs text-destructive mt-2 font-medium">
                          Emergency detector flagged high severity — prioritize safety.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      AI explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    {result.explanation}
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow border-primary/15">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Suggestions & tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-foreground leading-relaxed">
                    {result.suggestion}
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Top helpers
                    </CardTitle>
                    <CardDescription>Ranked by rating, experience, and distance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(result.top_helpers ?? []).map((h, idx) => (
                      <div
                        key={h.id ?? idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground">{h.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {h.role} · {h.experience_years ?? "—"} yrs exp
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-foreground">
                            ★ {h.rating?.toFixed(1)} · {h.distance_km?.toFixed(1) ?? "—"} km
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Score {h.score != null ? h.score.toFixed(2) : "—"}
                            {h.availability === false && " · busy"}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!result.top_helpers || result.top_helpers.length === 0) && (
                      <p className="text-sm text-muted-foreground">No helpers returned for this category.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
              Live assistant
            </p>
            <QuickHelpChatPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
