import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProjectsThunk,
  fetchProjectThunk,
  createProjectThunk,
  addMemberThunk,
  deleteProjectThunk,
} from "./projectThunk";

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  successMessage: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrentProject(state) {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProjectsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjectsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch one
      .addCase(fetchProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
        state.successMessage = "Project created successfully";
      })

      // Add member
      .addCase(addMemberThunk.fulfilled, (state, action) => {
        state.currentProject = action.payload;
        state.successMessage = "Member added successfully";
      })

      // Delete project
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (p) => p._id !== action.payload
        );

        // Clear current project if deleted
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }

        state.successMessage = "Project deleted successfully";
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProjectMessages, clearCurrentProject } =
  projectSlice.actions;

export default projectSlice.reducer;