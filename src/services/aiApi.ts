const postJSON = async (url: string, payload: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "AI request failed");
  }
  return data;
};

export const aiApi = {
  analyzeAll: (text: string) => postJSON("/api/ai/analyze-all", { text }),
  chat: (message: string, context: string[] = [], sessionId = "web-session") =>
    postJSON("/api/ai/chat", { message, context, session_id: sessionId }),
  gpsTrack: (helperId: string | number, step = 0) =>
    postJSON("/api/ai/gps-track", { helper_id: helperId, step }),
  recommend: (serviceCategory: string, topN = 3, userDistanceKm = 2) =>
    postJSON("/api/ai/recommend", {
      service_category: serviceCategory,
      top_n: topN,
      user_distance_km: userDistanceKm,
    }),
  predictPrice: (payload: {
    category: string;
    complexity?: number;
    distance?: number;
    experience?: number;
    urgency_level?: string;
  }) => postJSON("/api/ai/predict-price", payload),
};
