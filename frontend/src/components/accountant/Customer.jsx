import { useEffect, useState } from "react"
import { Spin, Pagination, Input, DatePicker, Button, message, Select, Descriptions } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, ProfileOutlined, MobileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const dateFormat = 'YYYY-mm-DD';
const { RangePicker } = DatePicker;
export default function Customer() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [startDate, setStartDate] = useState(dayjs().add(-7, 'd').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [sortBy, setSortBy] = useState("date_desc")
    const rangePresets = [
        {
            label: 'Last 7 Days',
            value: [dayjs().add(-7, 'd'), dayjs()],
        },
        {
            label: 'Last 14 Days',
            value: [dayjs().add(-14, 'd'), dayjs()],
        },
        {
            label: 'Last 30 Days',
            value: [dayjs().add(-30, 'd'), dayjs()],
        },
        {
            label: 'Last 90 Days',
            value: [dayjs().add(-90, 'd'), dayjs()],
        },
    ];
    const handleFilter = async () => {
        await getData(limit, page, startDate, endDate, sortBy)
    }
    const onChangeDate = (x, y) => {
        setStartDate(y[0])
        setEndDate(y[1])
    }
    return (
        <Spin tip="Đang tải. Xin vui lòng chờ" size="large" spinning={isLoading}>
            <Row>
                <Col xxl={6} xs={6} >
                    <span>Khoảng thời gian:</span>
                    <br></br>
                    <RangePicker presets={rangePresets} className="w-100" onChange={onChangeDate}
                        defaultValue={[dayjs().add(-7, 'd'), dayjs()]}
                    />
                </Col>
                <Col xxl={6} xs={6} >
                    <span></span>
                    <br></br>
                    <div className='d-flex'>
                        <Button type="primary" className='mx-2' icon={<SearchOutlined />} onClick={handleFilter}>
                            Tìm kiếm
                        </Button>
                    </div>
                </Col>
            </Row>
            <div className="mt-2">
                <Descriptions
                    title="Bảng tổng hợp về khách hàng"
                    bordered
                    column={{
                        xxl: 4,
                        xl: 3,
                        lg: 3,
                        md: 3,
                        sm: 2,
                        xs: 1,
                    }}
                >
                    <Descriptions.Item label="Tổng số lương khách">Cloud Database</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng mới">Prepaid</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng cũ">18:00:00</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng lũy kế">$80.00</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng active">$20.00</Descriptions.Item>
                </Descriptions>
            </div>
        </Spin>
    )
}