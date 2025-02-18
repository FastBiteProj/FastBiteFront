import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiManager from "../../apiManager";
import Cookies from 'js-cookie';

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async () => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/Product/Get`,
        Method: "GET",
        Headers: {
          "Content-Type": "application/json"
        },
      };
      return await ApiManager.apiRequest(apiData);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async ({ productName }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      console.log('Deleting product:', { productName });

      const apiData = {
        Url: `${baseUrl}/api/Product/Delete`,
        Method: 'DELETE',
        Headers: {
          'Authorization': `Bearer ${token}`,
          'accessToken': token
        },
        Params: { productName }
      };

      console.log('Delete request data:', apiData);

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      console.error('Delete error details:', error);
      
      try {
        const errorResponse = error.message;
        const jsonStart = errorResponse.indexOf('{');
        const jsonEnd = errorResponse.lastIndexOf('}') + 1;
        const errorData = JSON.parse(errorResponse.substring(jsonStart, jsonEnd));
        
        if (errorData.error) {
          return rejectWithValue(errorData.error);
        }
        
        return rejectWithValue(errorData.title || 'Failed to delete product');
      } catch (e) {
        return rejectWithValue(error.message || 'Failed to delete product');
      }
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productName, productDto }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      const apiData = {
        Url: `${baseUrl}/api/Product/Update`,
        Method: 'PUT',
        Headers: {
          'Authorization': `Bearer ${token}`,
          'accessToken': token
        },
        Params: { productName }, 
        Data: {
          name: productDto.name,
          price: productDto.price,
          imageUrl: productDto.imageUrl,
          categoryName: productDto.categoryName,
          translations: productDto.translations
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      let errorMessage = 'Failed to update product';
      try {
        const errorResponse = error.message;
        const jsonStart = errorResponse.indexOf('{');
        const jsonEnd = errorResponse.lastIndexOf('}') + 1;
        const errorData = JSON.parse(errorResponse.substring(jsonStart, jsonEnd));
        if (errorData.errors) {
          errorMessage = Object.entries(errorData.errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
        }
      } catch (e) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async (file, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      console.log('Token from cookies:', token);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}/api/Product/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accessToken': token
        },
        withCredentials: true,
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result = await response.text();
      return result;
    } catch (error) {
      console.error('Upload error details:', {
        error,
        token: Cookies.get('token'),
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'accessToken': Cookies.get('token')
        }
      });
      return rejectWithValue(error.message || 'Failed to upload image');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productDto, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      console.log('Token from cookies:', token);

      const response = await fetch(`${baseUrl}/api/Product/Create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accessToken': token
        },
        withCredentials: true,
        credentials: 'include',
        body: JSON.stringify(productDto)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create product error details:', {
        error,
        token: Cookies.get('token'),
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'accessToken': Cookies.get('token')
        }
      });
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async () => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Category/GetAllCategories`, 
        Method: "GET",
        Headers: {
          "Content-Type": "application/json"
        },
      };
      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
);;

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    categories: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {

        state.status = "loading";

      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.products = action.payload;

      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = state.products.filter(item => item.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update product';
      })
      .addCase(uploadProductImage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(uploadProductImage.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;