import { Column } from '@ant-design/plots';
import { useState, useEffect } from 'react';
import { Row, Col } from "react-bootstrap"
import { DatePicker,Spin } from "antd"
import dayjs from 'dayjs';
import axiosService from "../../utils/axios.config";
const { RangePicker } = DatePicker;

export default function BookingChart() {
    const [data, setData] = useState([])
    const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [isLoading, setIsLoading] = useState(false)
    const getData = async (start = dayjs().format('YYYY-MM-DD'), end = dayjs().format('YYYY-MM-DD')) => {
        setIsLoading(true)
        try {
            const res = await axiosService(`booking/chart?start=${start}&end=${end}`)
            console.log(res)
            if (res.data.code === 200) {
                setData(res.data.data)
                setIsLoading(false)
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
    useEffect(() => {
        async function fetchData() {
            await getData(startDate,endDate)
        }
        fetchData()
    }, [startDate,endDate])
    const config1 = {
        data: data.status || [],
        xField: 'type',
        yField: 'sales',
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'bottom', 'middle',
            // 配置样式
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            sales: {
                alias: 'Số lượng',
            },
        },
    };
    
    const config = {
        data:data?.type || [],
        xField: 'type',
        yField: 'sales',
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'bottom', 'middle',
            // 配置样式
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        color: '#F4664A',
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            sales: {
                alias: 'Số lượng',
            },
        },
    };
    const onChangeDate = (x, y) => {
        setStartDate(y[0])
        setEndDate(y[1])
    }
    return (
        <Spin tip="Đang tải. Xin vui lòng chờ" size="large" spinning={isLoading}>
            <Row>
                <Col xxl={4}>
                    <RangePicker
                        defaultValue={[dayjs(), dayjs()]}
                        format={"YYYY-MM-DD"}
                        onChange={onChangeDate}
                    />
                </Col>
            </Row>
            <Row className='mt-3'>
                <Col xxl={6} xs={12}>
                    <Column {...config} />
                </Col>
                <Col xxl={6} xs={12}>
                    <Column {...config1} />
                </Col>
            </Row>
        </Spin>
    )
}