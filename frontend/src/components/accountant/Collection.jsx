import { useEffect, useState,useRef } from "react"
import { Spin, Pagination, Select, Button, message, Drawer } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment'
import currencyConvert from '../../utils/currency';
export default function Collection() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [sortBy, setSortBy] = useState("date_desc")
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
            title: 'Mã đơn từ',
            dataIndex: 'order_code',
            key: "order_code",
            width: '5%',
            render: (x, record) => {
                return (
                    <>
                        {x || ""}
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Ngày',
            dataIndex: 'order_at',
            key: "order_at",
            width: '15%',
            render: (x, record) => {
                return (
                    <>
                        {moment(new Date(x)).format('DD/MM/YYYY')}
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Telesale',
            width: '5%',
            dataIndex: "source_from",
            key: "source_from",
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
            title: 'Cashier',
            dataIndex: 'created_name',
            key: "created_name",
            with: "5%",
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
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: "customer",
            width: '20%',
            render: (x, record) => {
                return <p>{x.full_name}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'product_name',
            key: "product_name",
            width: '20%',
            render: (x, record) => {
                return <p>{x}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Phương thức thanh toán ( TM/ bank)',
            dataIndex: 'payment_type',
            key: "payment_type",
            width: '10%',
            render: (x, record) => {
                return <p>{x}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Số tiền',
            dataIndex: 'priceFinal',
            key: "priceFinal",
            width: '10%',
            render: (x, record) => {
                return <p>{currencyConvert(x)}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
    ];
    const getData = async (limitFetch = 20, pageFetch = 1, sort = "date_desc") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/collection?page=${pageFetch}&limit=${limitFetch}&sortBy=${sort}`)
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
    const onChangePagination = async (page, pageSize) => {
        await getData(pageSize, page)
        setPage(page)
        setLimit(pageSize)
        window.scrollTo(0, 0)
    }
    useEffect(() => {
        async function fetchData() {
            await getData()
        }
        fetchData()
    }, [])
    const handleFilter = async () => {
        await getData(limit, page, sortBy)
    }
    const clearFilter = async () => {
        setLimit(20)
        setPage(1)
        setSortBy("date_desc")
        await getData(20, 1, "date_desc")
    }
    const onChangeSelectSortBy = (value) => {
        setSortBy(value)
    }
    return (
        <Spin tip="Đang tải. Xin vui lòng chờ" size="large" spinning={isLoading}>
            <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
                <Row>
                    <Col xxl={12} xs={12}>
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
                    <Col xxl={12} xs={12} >
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
                    <Button type="primary" className='ms-2' onClick={showDrawer} >
                        <FilterOutlined />
                    </Button>
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
                            scroll:{y:windowSize.current[1] || 500}
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