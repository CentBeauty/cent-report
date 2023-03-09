import { useEffect, useState } from "react"
import { Spin, message, Descriptions, Drawer, Button ,DatePicker} from "antd"
import axiosService from "../../utils/axios.config";
import dayjs from 'dayjs';
import currencyConvert from '../../utils/currency';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { FilterOutlined,SearchOutlined } from '@ant-design/icons';
import { Row, Col } from "react-bootstrap"
dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
export default function ReceiptCate() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState({})
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const getData = async (s="",e="") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/package-receipt?startDate=${s}&endDate=${e}`)
            if (res.data.code === 200) {
                setData(res.data.data)
                setIsLoading(false)
            } else {
                console.log(res)
                setIsLoading(false)
                message.error(res.data.message)
            }
        } catch (error) {
            console.error(error)
            message.error("Đã có lỗi xảy ra")
            setIsLoading(false)
        }
    }
    useEffect(() => {
        async function fetchData() {
            await getData(startDate,endDate)
        }
        fetchData()
    }, [])
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
        await getData(startDate,endDate)
    }
    const onChangeDate = (x, y) => {
        setStartDate(y[0])
        setEndDate(y[1])
    }
    return (
        <Spin tip="Xin vui lòng chờ. Dữ liệu nhiều có thể sẽ mất nhiều thời gian" size="large" spinning={isLoading}>
            <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
                <Row>
                    <Col xxl={12} xs={12}>
                        <Col xxl={12} xs={12} >
                            <span>Khoảng thời gian:</span>
                            <br></br>
                            <RangePicker presets={rangePresets} className="w-100" onChange={onChangeDate}
                                defaultValue={[dayjs().startOf('month'), dayjs()]}
                            />
                        </Col>
                    </Col>
                    <Col xxl={12} xs={12} className="mt-3" >
                        <span></span>
                        <br></br>
                        <div className='d-flex'>
                            <Button type="primary" className='me-2 w-100' icon={<SearchOutlined />} onClick={handleFilter}>
                                Tìm kiếm
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Drawer>
            <Row className='mt-1'>
                <Col xs={12}>
                    <div className="d-flex justify-content-start mb-2">
                        <Button type="primary" className='ms-2' onClick={showDrawer} >
                            <FilterOutlined />
                        </Button>
                    </div>
                </Col>
            </Row>
            <div className="mt-2">
                <Descriptions
                    title="Doanh số nhóm dịch vụ"
                    bordered
                    column={{
                        xxl: 3,
                        xl: 3,
                        lg: 2,
                        md: 2,
                        sm: 1,
                        xs: 1,
                    }}
                >
                    <Descriptions.Item label="Da">{currencyConvert(data['2'] || 0)}</Descriptions.Item>
                    <Descriptions.Item label="Phun xăm">{currencyConvert(data['4'] || 0)}</Descriptions.Item>
                    <Descriptions.Item label="Triệt long">{currencyConvert(data["5"] || 0)}</Descriptions.Item>
                </Descriptions>
            </div>
        </Spin>
    )
}