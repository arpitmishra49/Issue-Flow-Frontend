import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createProjectAPI,
  getProjectsAPI,
  getProjectAPI,
  addMemberAPI,
  deleteProjectAPI,
} from "../../api/project.api";

/**
 * Fetch all projects
 */
export const fetchProjectsThunk = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProjectsAPI();

      // Backend returns { status: "success", data: [...] }
      return res.data.data;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch projects"
      );
    }
  }
);

/**
 * Fetch single project
 */
export const fetchProjectThunk = createAsyncThunk(
  "projects/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getProjectAPI(id);

      return res.data.data;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch project"
      );
    }
  }
);

/**
 * Create project
 */
export const createProjectThunk = createAsyncThunk(
  "projects/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createProjectAPI(data);

      return res.data.data;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create project"
      );
    }
  }
);

/**
 * Add member to project
 */
export const addMemberThunk = createAsyncThunk(
  "projects/addMember",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await addMemberAPI(id, data);

      return res.data.data;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add member"
      );
    }
  }
);

/**
 * Delete project
 */
export const deleteProjectThunk = createAsyncThunk(
  "projects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteProjectAPI(id);

      // return id so reducer can remove it from state
      return id;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete project"
      );
    }
  }
);