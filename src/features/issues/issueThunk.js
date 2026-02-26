import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createIssueAPI,
  getIssuesAPI,
  assignIssueAPI,
  updateIssueStatusAPI,
  deleteIssueAPI,
} from "../../api/issue.api";

export const fetchIssuesThunk = createAsyncThunk(
  "issues/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getIssuesAPI(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch issues");
    }
  }
);

export const createIssueThunk = createAsyncThunk(
  "issues/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createIssueAPI(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create issue");
    }
  }
);

export const assignIssueThunk = createAsyncThunk(
  "issues/assign",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await assignIssueAPI(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to assign issue");
    }
  }
);

export const updateIssueStatusThunk = createAsyncThunk(
  "issues/updateStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateIssueStatusAPI(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

export const deleteIssueThunk = createAsyncThunk(
  "issues/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteIssueAPI(id);
      return id; // return id so slice can remove it
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete issue");
    }
  }
);