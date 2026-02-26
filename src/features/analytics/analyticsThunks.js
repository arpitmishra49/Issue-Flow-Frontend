import { createAsyncThunk } from "@reduxjs/toolkit";
import { getProjectAnalyticsAPI } from "../../services/analytics.api";

export const fetchAnalyticsThunk = createAsyncThunk(
  "analytics/fetchByProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await getProjectAnalyticsAPI(projectId);
      return res.data.data; // ✅ was res.data — backend wraps in { status, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch analytics");
    }
  }
);