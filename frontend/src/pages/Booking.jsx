import BookingTable from "../components/booking/BookingTable"
import { Card } from 'antd';
export default function Booking() {
    return (
        <>
            <Card
                title="Bảng chi tiết lịch đặt"
                bordered={false}
            >
                <BookingTable />
            </Card>
        </>
    )
}