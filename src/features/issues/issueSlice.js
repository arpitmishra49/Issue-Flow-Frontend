import { createSlice } from "@reduxjs/toolkit";
import {
  createIssueThunk,
  fetchIssuesThunk,
  assignIssueThunk,
  updateIssueStatusThunk,
  deleteIssueThunk,
} from "./issueThunk";

const initialState = {
  issues: [],
  loading: false,
  error: null,
  successMessage: null,
};

const issueSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    clearIssueMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchIssuesThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchIssuesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
      })
      .addCase(fetchIssuesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createIssueThunk.pending, (state) => { state.loading = true; })
      .addCase(createIssueThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.issues.unshift(action.payload);
        state.successMessage = "Issue created successfully";
      })
      .addCase(createIssueThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Assign
      .addCase(assignIssueThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?._id) {
          state.issues = state.issues.map((issue) =>
            issue._id === updated._id ? { ...issue, ...updated } : issue
          );
        }
      })
      .addCase(assignIssueThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to assign issue";
      })

      // Update Status
      .addCase(updateIssueStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        state.issues = state.issues.map((issue) =>
          issue._id === updated._id ? { ...issue, ...updated } : issue
        );
      })

      // Delete
      .addCase(deleteIssueThunk.fulfilled, (state, action) => {
        state.issues = state.issues.filter((issue) => issue._id !== action.payload);
        state.successMessage = "Issue deleted";
      })
      .addCase(deleteIssueThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearIssueMessages } = issueSlice.actions;
export default issueSlice.reducer;