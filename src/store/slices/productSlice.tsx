import axios, { AxiosError } from "axios";
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

import { IShaverma, CategoriesType, SortType } from "../../types";
import { RootState } from "..";

interface ICartState {
  items: Array<IShaverma>;
  status: "idle" | "loading" | "success" | "fail";
  error: string | null;
}

const initialState: ICartState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchAllProducts = createAsyncThunk<Array<IShaverma>>(
  "product/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://6321dfda82f8687273bb7341.mockapi.io/shavermas"
      );

      if (response.statusText !== "OK") {
        throw new Error("Server Error");
      }

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.message);
    }
  }
);

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.status = "success";
        state.items = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload as string;
      });
  },
});

const selectItems = (state: RootState) => state.product.items;

export const selectBy = (
  filterBy: CategoriesType,
  sorting: SortType,
  search: string
) =>
  createSelector(selectItems, (items) =>
    items
      .filter((item) =>
        filterBy !== "все" ? item.category === filterBy : true
      )
      .sort((a, b) => b[sorting] - a[sorting])
      .filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search) ||
          item.ingredients.some((ing) => ing.toLowerCase().includes(search))
      )
  );

export default productSlice.reducer;
