import { useEffect, useState, useRef } from "react"
import { Spin, Pagination, Input, DatePicker, Button, message, Select, Drawer } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import currencyConvert from '../../utils/currency';
import ExportXlsx from '../common/ExportXlsx';

const { RangePicker } = DatePicker;
export default function CustomerPackage() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [phone, setPhone] = useState("")
    const [order, setOrder] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [sortBy, setSortBy] = useState("date_desc")
    const [open, setOpen] = useState(false);
    const [type,setType] =useState("")
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
            width: '2%',
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
            title: 'Tên',
            dataIndex: 'product_name',
            key: "product_name",
            width: '10%',
            render: (y, record) => {
                return (<p>{y}</p>)
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Mã khách hàng',
            dataIndex: 'customer_mobile',
            key: "customer_mobile",
            width: '10%',
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
            title: 'Doanh số thuần',
            dataIndex: 'price',
            key: "price",
            width: '10%',
            render: (x, record) => {
                return (
                    <>
                        <p>{currencyConvert(x.sale > 0 ? x.sale : x.initial)}</p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Mã bill',
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
            title: 'Doanh thu/ buổi',
            dataIndex: 'receipt_per_count',
            key: "receipt_per_count",
            with: "10%",
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
            title: 'Số buổi được sử dụng',
            dataIndex: 'max_used',
            key: "max_used",
            sorter: (a, b) => a.max_used - b.max_used,
            width: '10%',
            render: (x, record) => {
                return <p>{x > 999 ? "Vĩnh viễn" : x}</p>
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
                return (
                    <p>
                        {x}
                    </p>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Số buổi đã sử dụng trong kỳ',
            dataIndex: 'useInRangeDate',
            key: "useInRangeDate",
            width: '10%',
            render: (x, record) => {
                return (
                    <>
                        {x}
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Doanh thu trong kỳ',
            dataIndex: 'ReceiptInDate',
            key: "ReceiptInDate",
            width: '10%',
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

    ];
    const getData = async (limitFetch = 20, pageFetch = 1, phoneFetch = "", orderId = "", start = "", end = "", sort = "date_desc",t="") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/customer-package?page=${pageFetch}&limit=${limitFetch}&mobile=${phoneFetch}&orderId=${orderId}&startDate=${start}&endDate=${end}&sortBy=${sort}&packageType=${t}`)
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
    const onChangeOrder = (e) => {
        setOrder(e.target.value)
    }
    const onChangePagination = async (page, pageSize) => {
        setPage(page)
        setLimit(pageSize)
        await getData(pageSize, page, phone, order, startDate, endDate, sortBy,type)
        window.scrollTo(0, 0)
    }
    const handleFilter = async () => {
        await getData(limit, page, phone, order, startDate, endDate, sortBy,type)
    }
    const clearFilter = async () => {
        setOrder("")
        setPhone("")
        setLimit(20)
        setPage(1)
        setStartDate("")
        setEndDate("")
        setSortBy("date_desc")
        setType("")
        await getData(20, 1, "", "", "", "", "date_desc","")
    }
    useEffect(() => {
        async function fetchData() {
            await getData()
        }
        fetchData()
    }, [])
    const onChangeDate = (x, y) => {
        setStartDate(y[0])
        setEndDate(y[1])
    }
    const onChangeSelectSortBy = (value) => {
        setSortBy(value)
    }
    const onChangeSelectType = (value) => {
        setType(value)
    }
    const handleExportData = async () => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/customer-package?page=${1}&limit=${total}&mobile=${phone}&orderId=${order}&startDate=${startDate}&endDate=${endDate}&sortBy=${sortBy}&packageType=${type}`)
            if (res.data.code === 200) {
                setIsLoading(false)
                const mapData = res.data.data.items.map((x, i) => {
                    return {
                        stt: i,
                        service: x.product_name,
                        customer: x.customer_mobile,
                        order_code: x.order_code,
                        net_revenue: x.price.sale > 0 ? x.price.sale : x.price.initial,
                        revenue_per_session: x.receipt_per_count,
                        max_used: x.max_used,
                        count_used: x.count_used,
                        use_in_range_date: x.useInRangeDate,
                        revenue_in_date: x.ReceiptInDate
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
                        <span>Khoảng thời gian:</span>
                        <br></br>
                        <RangePicker className="w-100" onChange={onChangeDate} />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Loại thẻ:</span>
                        <br></br>
                        <Select
                            value={type}
                            className='w-100'
                            onChange={onChangeSelectType}
                            options={[
                                {
                                    label: "Tất cả",
                                    value: ""
                                },
                                {
                                    label: 'Thẻ BHVV',
                                    value: 'BHVV',
                                },
                                {
                                    label: 'Thẻ buổi',
                                    value: 'ONE',
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
                        <ExportXlsx handleExportData={handleExportData} />
                    </div>
                </Col>
                <Col xs={12} className="d-flex justify-content-end px-4">
                    <p>Hiển thị <span className='text-success fw-bold'>{data.length}</span> trên <span className='text-warning fw-bold'>{total}</span>.
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