import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosService from '../../utils/axios.config';
const initialState = {
    data: {},
    role: null
}

export const UserSlice = createSlice({
    name: 'user',
    initialState,
    // reducers: {
    //     getUser: (state, action) => {
    //         console.log("aaaaa")
    //     },
    // },
    extraReducers: builder => {
        builder
            .addCase(getData.fulfilled, (state, action) => {
                const { payload } = action
                if (payload.code === 200) {
                    state.data = payload.data
                    state.role = payload.data.role
                }
            })
    }
})
export const { getUser } = UserSlice.actions

export default UserSlice.reducer

export const getData = createAsyncThunk('user/getData', async () => {
    try {
        const res = await axiosService("users", "GET")
        return res.data
    } catch (error) {
        console.error(error)
    }
})



