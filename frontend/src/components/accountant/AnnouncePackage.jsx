import { useEffect, useState, useRef } from "react"
import { Spin, Pagination, Input, Select, Button, message, Tag, Drawer, InputNumber } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, ProfileOutlined, MobileOutlined, FilterOutlined } from '@ant-design/icons';
import ExportXlsx from '../common/ExportXlsx';
export default function Announce() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [phone, setPhone] = useState("")
    const [order, setOrder] = useState("")
    const [status, setStatus] = useState("")
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [sortBy, setSortBy] = useState("date_desc")
    const [open, setOpen] = useState(false);
    const [start, setStart] = useState("")
    const [end, setEnd] = useState("")
    const [dangers,setDangers] = useState(0)
    const [normal,setNormal] = useState(0)
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
            width: '20%',
            render: (x, record) => {
                return (
                    <>
                        <div className="d-flex">
                            <ProfileOutlined className="mt-1" /><p> {x.name}</p>
                        </div>
                        <div className="d-flex">
                            <MobileOutlined className="mt-1" /><p> {x ? x.phone : "Không có"}</p>
                        </div>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'package',
            key: "package",
            width: '20%',
            render: (x, record) => {
                return (
                    <>
                        <p>Tên: {x.name}</p>
                        <p>Code: <span className="text-success">{x ? x.code : "Không có"}</span></p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Mã đơn hàng',
            width: '10%',
            dataIndex: "order_code",
            key: "order_code",
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
            title: 'Số buổi được sử dụng',
            dataIndex: 'max_used',
            key: "max_used",
            with: "10%",
            render: (x, record) => {
                return (
                    <>
                        <p >{x > 9999 ? "Vĩnh viễn" : x} </p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Số buổi đã sử dụng',
            dataIndex: 'count_used',
            key: "count_used",
            sorter: (a, b) => a.count_used - b.count_used,
            width: '10%',
            render: (x, record) => {
                return <p>{x}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Tình trạng',
            dataIndex: 'count_used',
            key: "count_used",
            width: '10%',
            render: (x, record) => {
                return (
                    <>
                        {x >= 11 ? <Tag color="red">Báo động</Tag> : <Tag color="green">Bình thường</Tag>}
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
    ];
    const onChangeSelect = (value) => {
        setStatus(value)
    }
    const onChangeSelectSortBy = (value) => {
        setSortBy(value)
    }
    const onChangePhone = (e) => {
        setPhone(e.target.value)
    }
    const onChangeOrder = (e) => {
        setOrder(e.target.value)
    }
    const handleFilter = async () => {
        await getData(limit, page, phone, order, status, sortBy, start, end)
    }
    const getData = async (limitFetch = 20, pageFetch = 1, phoneFetch = "", orderId = "", statusFetch = "", sort = "date_desc", s = "", e = "") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/announce-package?page=${pageFetch}&limit=${limitFetch}&mobile=${phoneFetch}&status=${statusFetch}&orderId=${orderId}&sortBy=${sort}&start=${s}&end=${e}`)
            if (res.data.code === 200) {
                const { items, meta, } = res.data.data.table
                console.log("res.data.data",res.data.data)
                setDangers(res.data.data.dangers)
                setNormal(res.data.data.normal)
                setData([...items])
                setTotal(meta.totalItems)
                setIsLoading(false)
                onClose()
                return items
            } else {
                console.log(res)
                message.error(res.data.message)
                setIsLoading(false)
                return []
            }
        } catch (error) {
            console.error(error)
            message.error("Đã có lỗi xảy ra")
            setIsLoading(false)
            return []
        }
    }
    useEffect(() => {
        async function fetchData() {
            await getData()
        }
        fetchData()
    }, [])
    const clearFilter = async () => {
        setOrder("")
        setStatus("")
        setPhone("")
        setLimit(20)
        setPage(1)
        await getData(20, 1, "", "", "", "date_desc", "", "")
    }
    const onChangePagination = async (page, pageSize) => {
        setPage(page)
        setLimit(pageSize)
        await getData(pageSize, page, phone, order, status, sortBy, start, end)
        window.scrollTo(0, 0)
    }
    const onChangeStart = (x) => {
        setStart(x)
    }
    const onChangeEnd = (x) => {
        setEnd(x)
    }
    const handleExportData = async () => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/announce-package?page=${1}&limit=${total}&mobile=${phone}&status=${status}&orderId=${order}&sortBy=${sortBy}&start=${start}&end=${end}`)
            if (res.data.code === 200) {
                setIsLoading(false)
                const mapData = res.data.data.items.map((x,i)=>{
                    return{
                        stt:i,
                        customer:x.customer.name,
                        service:x.product_name,
                        order_code:x.order_code,
                        number_session_is_use:x.max_used,
                        count_used : x.count_used,
                        status: x.count_used >=11 ? "Báo động" : "Bình thường"
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
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Mã hoá đơn:</span>
                        <Input onChange={onChangeOrder} placeholder="Nhập mã hoá đơn" value={order} />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Khoảng buổi:</span>
                        <div className="d-flex justify-content-between">
                            <InputNumber min={0} value={start} className="w-100 me-2" onChange={onChangeStart} placeholder="Bắt đầu" />
                            <InputNumber min={0} value={end} onChange={onChangeEnd} className="w-100" placeholder="Kết thúc" />
                        </div>
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Trạng thái:</span>
                        <br></br>
                        <Select
                            value={status}
                            className='w-100'
                            onChange={onChangeSelect}
                            options={[
                                {
                                    label: "Tất cả",
                                    value: ""
                                },
                                {
                                    label: 'Báo động',
                                    value: 'danger',
                                },
                                {
                                    label: 'Bình thường',
                                    value: 'normal',
                                },
                            ]}
                        />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Sắp xếp theo:</span>
                        <br></br>
                        <Select
                            value={sortBy}
                            className='w-100'
                            onChange={onChangeSelectSortBy}
                            options={[
                                {
                                    label: "Thời gian tạo gần nhất",
                                    value: "date_desc"
                                },
                                {
                                    label: 'Thời gian tạo xa nhất',
                                    value: 'date_asc',
                                },
                            ]}
                        />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-3" >
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
                    <p className="me-3">Hiển thị <span className='text-success fw-bold'>{data.length}</span> trên <span className='text-warning fw-bold'>{total}</span>.</p>
                    <p>Số thẻ báo động: <span className='text-danger fw-bold'>{dangers}</span>. Số thẻ bình thưởng <span className='text-success fw-bold'>{normal}</span>.
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