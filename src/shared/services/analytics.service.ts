import { api } from "./api";

const getAuthToken = (token?: string): string | undefined => {
  if (token) return token;
  const fromStorage = localStorage.getItem("auth_token");
  return fromStorage || undefined;
};

export interface TrackPayload {
  session_id: string;
  event_name: string;
  page_path: string;
  user_id?: number | null;
  ip_address?: string;
  city?: string;
  country?: string;
  device_type?: string;
  os?: string;
  browser?: string;
  referrer?: string;
  event_metadata?: Record<string, any>;
}

export interface TopItem {
  label: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesItem {
  date: string;
  count: number;
}

export interface DashboardSummary {
  total_sessions: number;
  total_page_views: number;
  total_events: number;
  avg_duration_seconds: number | null;
  unique_visitors: number;
  active_sessions: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  devices: TopItem[];
  cities: TopItem[];
  browsers: TopItem[];
  hourly_distribution: TopItem[];
  daily_distribution: TopItem[];
  pages: TopItem[];
  sessions_over_time: TimeSeriesItem[];
  cta_clicks: number;
  avg_time_on_page: number | null;
}

export const AnalyticsService = {
  track: async (payload: TrackPayload): Promise<{ status: string }> => {
    return api.post("analytics/track", payload);
  },

  endSession: async (sessionId: string, durationSeconds: number): Promise<{ status: string }> => {
    return api.post("analytics/session/end", null, {
      params: { session_id: sessionId, duration_seconds: durationSeconds },
    });
  },

  updatePageViewDuration: async (
    sessionId: string,
    pagePath: string,
    timeOnPage: number
  ): Promise<{ status: string }> => {
    return api.put("analytics/pageview/duration", null, {
      params: { session_id: sessionId, page_path: pagePath, time_on_page: timeOnPage },
    });
  },

  getDashboard: async (days: number = 30, pageFilter?: string): Promise<DashboardData> => {
    return api.get("analytics/dashboard", {
      token: getAuthToken(),
      params: { days, page_filter: pageFilter },
    });
  },

  getActiveSessions: async (): Promise<{ active_sessions: number; window_minutes: number }> => {
    return api.get("analytics/active-sessions", {
      token: getAuthToken(),
    });
  },
};
