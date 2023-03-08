import { useEffect, useState, useRef } from "react"
import { Spin, Pagination, Input, Button, message, Tag, Drawer } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, ProfileOutlined, MobileOutlined, FilterOutlined } from '@ant-design/icons';
import currencyConvert from '../../utils/currency';
import ExportXlsx from '../common/ExportXlsx';
export default function ActiveCustomer() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [phone, setPhone] = useState("")
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
            title: 'STT',
            dataIndex: 'id',
            key: "id",
            width: '10%',
            render: (y, record) => {
                const findIndex = data.findIndex(x => {
                    return x.id == y
                })
                return (<p>{findIndex + 1}</p>)
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: "customer",
            width: '30%',
            render: (x, record) => {
                return (
                    <>
                        <div className="d-flex">
                            <ProfileOutlined className="mt-1 mx-1" /><p> {x.name}</p>
                        </div>
                        <div className="d-flex">
                            <MobileOutlined className="mt-1 mx-1" /><p> {x ? x.phone : "Không có"}</p>
                        </div>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Loại',
            dataIndex: 'isOld',
            key: "isOld",
            width: '10%',
            render: (x, record) => {
                return (
                    <>
                        {x ? <Tag color="volcano">Khách cũ</Tag> : <Tag color="green">Khách mới</Tag>}
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Số lượng Bill',
            width: '10%',
            dataIndex: "billNumber",
            key: "billNumber",
            render: (x, record) => {
                return (
                    <>
                        <p>{x}</p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Doanh số thuần theo bill đã mua',
            dataIndex: 'sumMoney',
            key: "sumMoney",
            with: "10%",
            sorter: (a, b) => a.sumMoney - b.sumMoney,
            render: (x, record) => {
                return (
                    <>
                        <p>{currencyConvert(x)}</p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Doanh số bình quân/ bill',
            dataIndex: 'sumPerBills',
            key: "sumPerBills",
            sorter: (a, b) => a.sumPerBills - b.sumPerBills,
            width: '10%',
            render: (x, record) => {
                return <p>{currencyConvert(x)}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
    ];
    const getData = async (limitFetch = 20, pageFetch = 1, phoneFetch = "") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/customer-active?page=${pageFetch}&limit=${limitFetch}&mobile=${phoneFetch}`)
            if (res.data.code === 200) {
                const { items, meta, } = res.data.data
                setData([...items])
                setTotal(meta.totalItems)
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
    const onChangePhone = (e) => {
        setPhone(e.target.value)
    }

    const onChangePagination = async (page, pageSize) => {
        setPage(page)
        setLimit(pageSize)
        window.scrollTo(0, 0)
        await getData(pageSize, page, phone)
    }
    const handleFilter = async () => {
        await getData(limit, page, phone)
    }
    const clearFilter = async () => {
        setPhone("")
        setLimit(20)
        setPage(1)
        await getData(20, 1, "")
    }
    useEffect(() => {
        async function fetchData() {
            await getData()
        }
        fetchData()
    }, [])
    const handleExportData = async () => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/customer-active?page=${1}&limit=${total}&mobile=${phone}`)
            if (res.data.code === 200) {
                setIsLoading(false)
                const mapData = res.data.data.items.map((x, i) => {
                    return {
                        stt: i,
                        customer:x.full_name,
                        type: x.isOld ? "Khách cũ" : "Khách mới",
                        bill_number: x.billNumber,
                        money_total:x.sumMoney,
                        money_per_bills:x.sumPerBills
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
    return (
        <Spin tip="Đang tải. Xin vui lòng chờ" size="large" spinning={isLoading}>
            <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
                <Row>
                    <Col xxl={12} xs={12}>
                        <span>Số điện thoại:</span>
                        <Input onChange={onChangePhone} placeholder="Nhập số điện thoại khách hàng" value={phone} />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-3" >
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
                        <ExportXlsx handleExportData={handleExportData} />
                    </div>
                </Col>
                <Col xs={12} className="d-flex justify-content-end px-4">
                    <p>Hiển thị <span className='text-success fw-bold'>{data.length}</span> trên <span className='text-warning fw-bold'>{total}</span>
                        {/* Tổng số tiền nợ: <span className='text-danger'>{currencyConvert(sumOwed)}</span> .Tổng số: <span className='text-primary'>{currencyConvert(sum)}</span> */}
                    </p>
                </Col>
            </Row>
            <Row className='mt-0'>
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
                <Col xs={12} className="mt-5">
                    <div className='d-flex justify-content-end'>
                        <Pagination current={page} pageSize={limit} total={total} onChange={onChangePagination} />
                    </div>
                </Col>
            </Row>
        </Spin>
    )
}