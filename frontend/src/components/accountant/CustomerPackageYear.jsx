import { useEffect, useState } from "react"
import { Spin, DatePicker, Button, message, Drawer,Input } from "antd"
import { Row, Col, Table } from "react-bootstrap"
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import moment from "moment"
import dayjs from 'dayjs';
import "../../styles/fixHeader.style.css"
export default function CustomerPackageYear() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState(moment(new Date()).format('YYYY'))
    const [name, setName] = useState("")
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const onChange = (date, dateString) => {
        setYear(dateString);
    };
    const getData = async (y = moment(new Date()).format('YYYY'),n="") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/customer-package-year?year=${y}&product_name=${n}`)
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
    const onChangeName = (e) => {
        setName(e.target.value)
    }
    const handleFilter = async () => {
        await getData(year, name)
    }
    const clearFilter = async () => {
        setName("")
        setYear(moment(new Date()).format('YYYY'))
        await getData(moment(new Date()).format('YYYY'), "")
    }
    useEffect(() => {
        async function fetchData() {
            await getData(year, name)
        }
        fetchData()
    }, [])
    return (
        <Spin tip="Đang tải. Dữ liệu lớn có thể mất vài phút. Vui lòng chờ" size="large" spinning={isLoading}>
            <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
                <Row>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Nhập tên dịch vụ:</span>
                        <Input onChange={onChangeName} placeholder="Nhập tên sản phẩm" value={name} />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Khoảng thời gian:</span>
                        <br></br>
                        <DatePicker onChange={onChange} defaultValue={dayjs()} className="w-100" picker="year" />
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
                    </div>
                </Col>
            </Row>
            <Row className='mt-0'>
                <Col xs={12} className="w-100">
                <Table striped bordered hover responsive className="table-fixed">
                        <thead style={{position: "sticky", top: 0}}>
                            <tr>
                                <th>Tên dịch vụ</th>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(x => {
                                    return <th>{`Tháng ${x}`}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody className="scroll-table">
                            {data.length > 0 && data.map(x => {
                                return <tr>
                                        <td>{x[0]}</td>
                                        {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(y => {
                                            return <td>{x[1][y] || 0}</td>
                                        })}
                                    </tr>
                            })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Spin>
    )
}