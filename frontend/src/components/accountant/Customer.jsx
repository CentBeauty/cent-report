import { useEffect, useState ,useRef} from "react"
import { Spin, DatePicker, Button, message, Descriptions, Drawer } from "antd"
import { Row, Col } from "react-bootstrap"
import axiosService from "../../utils/axios.config";
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
export default function Customer() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState({
        newCount: 0,
        activeCount: 0,
        total: 0,
        oldCount: 0,
        package: 0
    })
    const [startDate, setStartDate] = useState(dayjs().add(-7, 'd').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [open, setOpen] = useState(false);
    const windowSize = useRef([window.innerWidth, window.innerHeight]);
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
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
    const getData = async (start = "", end = "") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/customers?startDate=${start}&endDate=${end}`)
            if (res.data.code === 200) {
                setData(res.data.data)
                setIsLoading(false)
                onClose()
            } else {
                console.log(res)
                message.error(res.data.message)
            }
        } catch (error) {
            console.error(error)
            message.error("Đã có lỗi xảy ra")
            setIsLoading(false)
        }
    }
    const handleFilter = async () => {
        await getData(startDate, endDate)
    }
    const onChangeDate = (x, y) => {
        setStartDate(y[0])
        setEndDate(y[1])
    }
    useEffect(() => {
        async function fetchData() {
            await getData(startDate, endDate)
        }
        fetchData()
    }, [])
    return (
        <Spin tip="Xin vui lòng chờ. Dữ liệu nhiều có thể sẽ mất nhiều thời gian" size="large" spinning={isLoading}>
            <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
                <Row>
                    <Col xxl={12} xs={12} >
                        <span>Khoảng thời gian:</span>
                        <br></br>
                        <RangePicker presets={rangePresets} className="w-100" onChange={onChangeDate}
                            defaultValue={[dayjs().add(-7, 'd'), dayjs()]}
                        />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-3" >
                        <span></span>
                        <br></br>
                        <div className='d-flex'>
                            <Button type="primary" className='w-100' icon={<SearchOutlined />} onClick={handleFilter}>
                                Tìm kiếm
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Drawer>
            <Row className='mt-1'>
                <Col xs={12}>
                    <Button type="primary" className='ms-2' onClick={showDrawer} >
                        <FilterOutlined />
                    </Button>
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
                    <Descriptions.Item label="Tổng số lương khách">{data.total}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng mới">{data.newCount}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng cũ">{data.oldCount}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng lũy kế">{0}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng active">{data.activeCount}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng khách hàng liệu trình">{data.package}</Descriptions.Item>
                </Descriptions>
            </div>
        </Spin>
    )
}