import 'antd/dist/reset.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { AuthenticationMiddle } from "./middleware/authentication";
import Homepage from './pages/Homepage';
import Authorize from "./middleware/authorize";
import NotfoundPage from './components/results/404';
import AccountantPage from './pages/Accountant';
import Booking from "./pages/Booking"
import 'bootstrap/dist/css/bootstrap.min.css';
import linkEnum from './enums/link.enum';
import "./styles/index.css"
export default function App() {
    return (
        <Routes>
            <Route path={linkEnum.LOGIN_PAGE} element={<Login />} />
            <Route path="*" element={<NotfoundPage />} />
            <Route element={<AuthenticationMiddle />}>
                <Route path={linkEnum.HOME_PAGE} element={<Homepage />} />
                <Route path={linkEnum.ACCOUNTANT_PAGE} element={
                    <AccountantPage />
                } />
                 <Route path={linkEnum.BOOKING_PAGE} element={
                    <Booking />
                } />
            </Route>
        </Routes>
    );
}