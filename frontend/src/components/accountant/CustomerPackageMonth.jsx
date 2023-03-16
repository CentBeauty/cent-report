import { useEffect, useState } from "react"
import { Spin, DatePicker, Button, message, Drawer, Input } from "antd"
import { Row, Col, Table } from "react-bootstrap"
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, FilterOutlined, VerticalLeftOutlined } from '@ant-design/icons';
import moment from "moment"
import dayjs from 'dayjs';
import "../../styles/fixHeader.style.css"
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css'
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useNavigate } from "react-router-dom";

export default function CustomerPackageMonth() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [headers, setHeaders] = useState([])
    const [open, setOpen] = useState(false);
    const [startYear, setStartYear] = useState(moment(new Date()).format('YYYY'))
    const [endYear, setEndYear] = useState(moment(new Date()).format('YYYY'))

    let navigate = useNavigate();

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const onChangeStart = (date, dateString) => {
        setStartYear(dateString);
    };
    const onChangeEnd = (date, dateString) => {
        setEndYear(dateString);
    };
    const handleFilter = async () => {
        await getData(startYear, endYear)
    }
    const clearFilter = async () => {
        setEndYear(moment(new Date()).format('YYYY'))
        setStartYear(moment(new Date()).format('YYYY'))
        await getData(moment(new Date()).format('YYYY'), moment(new Date()).format('YYYY'))
    }
    const getData = async (s = moment(new Date()).format('YYYY'), e = moment(new Date()).format('YYYY')) => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/count-package-month?end=${e}&start=${s}`)
            if (res.data.code === 200) {
                setHeaders(res.data.data[0])
                res.data.data.shift()
                setData(res.data.data)
                setIsLoading(false)
                onClose()
            } else {
                console.log(res)
                message.error(res.data.message)
                setIsLoading(false)
            }
        } catch (error) {
            console.error(error)
            message.error("Đã có lỗi xảy ra")
            setIsLoading(false)
        }
    }
    useEffect(() => {
        async function fetchData() {
            await getData(startYear, endYear)
        }
        fetchData()
    }, [])
    const handleExport = async () =>{
        try {
            setIsLoading(true)
            const res = await axiosService(`export/customer-service?end=${startYear}&start=${endYear}`)
            if (res.data.code === 200) {
                return window.open(res.data.data, '_blank');
            } else {
                console.log(res)
                message.error(res.data.message)
                setIsLoading(false)
            }
        } catch (error) {
            console.error(error)
            message.error("Lỗi xuất báo cáo")
            setIsLoading(false)
        }
    }
    return (
        <Spin tip="Đang tải. Dữ liệu lớn có thể mất vài phút. Vui lòng chờ" size="large" spinning={isLoading}>
            <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
                <Row>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Năm bắt đầu:</span>
                        <br></br>
                        <DatePicker onChange={onChangeStart} defaultValue={dayjs()} className="w-100" picker="year" />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Năm kết thúc:</span>
                        <br></br>
                        <DatePicker onChange={onChangeEnd} defaultValue={dayjs()} className="w-100" picker="year" />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span></span>
                        <br></br>
                        <div className='d-flex'>
                            <Button type="primary" className='me-2 w-100' icon={<SearchOutlined />} onClick={handleFilter}>
                                Tìm kiếm
                            </Button>
                            <Button onClick={clearFilter} type="primary" className="w-100" danger icon={<CloseOutlined />}>
                                Xoá
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Drawer>
            <Row className='mt-1'>
                <Col xs={12}>
                    <div className="d-flex justify-content-between mb-2">
                        <Button type="primary" className='ms-2' onClick={showDrawer} >
                            <FilterOutlined />
                        </Button>
                        <Button type="primary" style={{ backgroundColor: "green" }} onClick={handleExport} >
                            <VerticalLeftOutlined /> <span>Xuất dữ liệu</span>
                        </Button>
                    </div>
                </Col>
            </Row>
            <Row className='mt-0'>
                <Col xs={12} className="w-100">
                    {data.length > 0 &&
                        <Table striped bordered hover responsive className="table-fixed" pagination={paginationFactory()}>
                            <thead style={{ position: "sticky", top: 0 }}>
                                <tr>
                                    {headers.map(x => {
                                        return <th>{x}</th>
                                    })}
                                </tr>
                            </thead>
                            <tbody className="scroll-table">
                                {data.map(x => {
                                    return <tr>
                                        {
                                            x.map(y => {
                                                return <td>{y}</td>
                                            })
                                        }
                                    </tr>
                                })}
                            </tbody>
                        </Table>
                    }
                </Col>
            </Row>
        </Spin>
    )
}