import { useEffect, useState, useRef } from "react"
import { Spin, Select, Button, message, Drawer } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import packageStatusEnum from "../../enums/package.status.enum";
import ExportXlsx from '../common/ExportXlsx';
export default function PackageNumber() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [status, setStatus] = useState("1")
    const [open, setOpen] = useState(false);
    const windowSize = useRef([window.innerWidth, window.innerHeight]);
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const columns = [
        {
            title: 'Tên dịch vụ thẻ',
            dataIndex: 'product_product_name',
            key: "product_product_name",
            width: '70%',
            render: (y, record) => {
                return (<p>{y}</p>)
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Số lượng',
            dataIndex: 'amount',
            key: "amount",
            width: '30%',
            sorter: (a, b) => a.amount - b.amount,
            render: (x, record) => {
                return (
                    <>
                        {x || 0}
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
    ];
    const getData = async (s = "1") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/count-package?status=${s}`)
            if (res.data.code === 200) {
                setData([...res.data.data])
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
    useEffect(() => {
        async function fetchData() {
            await getData(status)
        }
        fetchData()
    }, [])
    const handleFilter = async () => {
        await getData(status)
    }
    const onChangeSelectSortBy = (value) => {
        setStatus(value)
    }
    const handleExportData = async () => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/count-package?status=${status}`)
            if (res.data.code === 200) {
                setIsLoading(false)
                const mapData = res.data.data.map((x, i) => {
                    return {
                        stt: i,
                        service_name: x.product_product_name,
                        number:x.amount
                    }
                })
                return mapData
            } else {
                message.error("Có lỗi xảy ra xin vui lòng thử lại")
                console.error(data.message)
                setIsLoading(false)
                return []
            }
        } catch (error) {
            console.error(error)
            message.error("Có lỗi xảy ra xin vui lòng thử lại")
            setIsLoading(false)
            return []
        }
    }
    return <Spin tip="Đang tải. Xin vui lòng chờ" size="large" spinning={isLoading}>
        <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
            <Row>
                <Col xxl={12} xs={12}>
                    <span>Trạng thái:</span>
                    <br></br>
                    <Select
                        value={status}
                        className='w-100'
                        onChange={onChangeSelectSortBy}
                        options={packageStatusEnum}
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
                <div className="d-flex justify-content-between mb-2">
                    <Button type="primary" className='ms-2' onClick={showDrawer} >
                        <FilterOutlined />
                    </Button>
                    <ExportXlsx handleExportData={handleExportData} />
                </div>
            </Col>
        </Row>
        <Row className='mt-5'>
            <Col xs={12} className="w-100">
                <Table
                    antTableProps={{
                        showHeader: true,
                        columns,
                        dataSource: data,
                        pagination: false,
                        scroll: { y: windowSize.current[1] || 500 }
                    }}
                    mobileBreakPoint={768}
                />
            </Col>
        </Row>
    </Spin>
}