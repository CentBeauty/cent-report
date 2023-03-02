import { configureStore } from '@reduxjs/toolkit'
import UserSlice from "./reducers/user"

const store = configureStore({
    reducer: {
        user: UserSlice,
    },
})
export default store
