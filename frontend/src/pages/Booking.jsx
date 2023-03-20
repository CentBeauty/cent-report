import BookingTable from "../components/booking/BookingTable"
import BookingChart from "../components/booking/BookingChart";
import { Card } from 'antd';
export default function Booking() {
    return (
        <>
            <Card
                title="Thống kê biểu đồ"
                bordered={false}
            >
                <BookingChart />
            </Card>
            <Card
                title="Bảng chi tiết lịch đặt"
                bordered={false}
            >
                <BookingTable />
            </Card>
        </>
    )
}