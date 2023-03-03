import { useEffect, useState } from "react"
import { Spin, Pagination, Input, DatePicker, Button, message, Select, Descriptions } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, ProfileOutlined, MobileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import currencyConvert from '../../utils/currency';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const dateFormat = 'YYYY-mm-DD';
const { RangePicker } = DatePicker;
export default function ReceiptCate(){
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState({})
    const getData = async (limitFetch = 20, pageFetch = 1,sort="date_desc") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/package-receipt`)
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
            await getData()
        }
        fetchData()
    }, [])
    return (
        <Spin tip="Xin vui lòng chờ. Dữ liệu nhiều có thể sẽ mất nhiều thời gian" size="large" spinning={isLoading}>
        <div className="mt-2">
            <Descriptions
                title="Bảng tổng hợp về khách hàng"
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
                <Descriptions.Item label="Phun xăm">{currencyConvert(data['4']||0)}</Descriptions.Item>
                <Descriptions.Item label="Triệt long">{currencyConvert(data["5"]||0)}</Descriptions.Item>
            </Descriptions>
        </div>
    </Spin>
    )
}