import { Navigate } from "react-router-dom";
const Authorize = ({ permissions, children }) => {
    const { role } = JSON.parse(localStorage.getItem("user_info")) || -1
    if (!permissions.includes(role)) {
        return <Navigate to="/login" replace={true} />
    }
    return children;
};
export default Authorize