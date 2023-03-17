import { useEffect, useState, useRef } from "react"
import { Spin, Pagination, Select, Button, message, Drawer, DatePicker, Input } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment'
import { bookingStatus } from "../../enums/booking.status";
import { optionsSourceBooking } from "../../enums/sources.enum";
const { RangePicker } = DatePicker;
export default function BookingTable() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [sortBy, setSortBy] = useState("DESC")
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [status, setStatus] = useState("")
    const [type, setType] = useState("")
    const windowSize = useRef([window.innerWidth, window.innerHeight]);
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const onChangeDate = (x, y) => {
        setStartDate(y[0])
        setEndDate(y[1])
    }
    const getData = async (limitFetch = 20, pageFetch = 1, sort = "desc", start = "", end = "", s = "", t) => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/booking-table?start=${start}&end=${end}&status=${s}&type=${t}&limit=${limitFetch}&page=${pageFetch}&sortBy=${sort}`)
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
        await getData(pageSize, page, sortBy, startDate, endDate, status, type)
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
        await getData(limit, page, sortBy, startDate, endDate, status, type)
    }
    const clearFilter = async () => {
        setLimit(20)
        setPage(1)
        setSortBy("DESC")
        setStatus("")
        setStartDate("")
        setEndDate("")
        setType("")
        await getData(20, 1, "DESC", "", "", "", "")
    }
    const onChangeSelectSortBy = (value) => {
        setSortBy(value)
    }
    const onChangeSelectType = (value) => {
        setType(value)
    }
    const onChangeSelectStatus = (value) => {
        setStatus(value)
    }
    const columns = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: "id",
            width: '5%',
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
            title: 'Mã lịch đặt',
            dataIndex: 'book_code',
            key: "book_code",
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
            title: 'Ngày đặt lịch',
            dataIndex: 'book_date',
            key: "book_date",
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
            title: 'Nguồn',
            dataIndex: "source_from",
            key: "source_from",
            render: (x, record) => {
                return (
                    <>
                        <p>{optionsSourceBooking[x]}</p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customers',
            key: "customers",
            with: "15%",
            render: (x, record) => {
                return (
                    <>
                        <p>Tên: {x.full_name}</p>
                        <p>Số điện thoại: {x.mobile}</p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Cơ sở',
            dataIndex: 'stores',
            key: "stores",
            width: '15%',
            render: (x, record) => {
                return <p>{x.name_store}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'booking_item',
            key: "booking_item",
            width: '20%',
            render: (x, record) => {
               return  <>
               {x.map(y => {
                   return <>
                       {y.product_ids.map(z => {
                           return <p>{z.product_name}</p>
                       })}
                   </>
               })}
           </>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Trạng thái',
            dataIndex: 'book_status',
            key: "book_status",
            width: '10%',
            render: (x, record) => {
                return <p>{bookingStatus[x]}</p>
            },
            showOnResponse: true,
            showOnDesktop: true
        },
    ];
    return (
            <Spin tip="Đang tải. Xin vui lòng chờ" size="large" spinning={isLoading}>
                <Drawer title="Tìm kiếm" placement="right" onClose={onClose} open={open}>
                    <Row>
                        <Col xxl={12} xs={12} className="mt-2">
                            <span>Khoảng thời gian:</span>
                            <br></br>
                            <RangePicker className="w-100" onChange={onChangeDate} />
                        </Col>
                        <Col xxl={12} xs={12} className="mt-2">
                            <span>Trạng thái:</span>
                            <br></br>
                            <Select
                                value={status}
                                className='w-100'
                                onChange={onChangeSelectStatus}
                                options={[
                                    {
                                        label: "Tất cả",
                                        value: ""
                                    },
                                    {
                                        label: 'Chưa xác nhận',
                                        value: '1',
                                    },
                                    {
                                        label: "Đã xác nhận",
                                        value: "2"
                                    },
                                    {
                                        label: 'Chờ phục vụ',
                                        value: '3',
                                    },
                                    {
                                        label: "Đang phục vụ",
                                        value: "4"
                                    },
                                    {
                                        label: 'Hủy lịch',
                                        value: '5',
                                    },
                                    {
                                        label: "Không đến",
                                        value: "6"
                                    },
                                    {
                                        label: 'Hoàn thành',
                                        value: '7',
                                    },
                                ]}
                            />
                        </Col>
                        <Col xxl={12} xs={12} className="mt-2">
                            <span>Sắp xếp theo:</span>
                            <br></br>
                            <Select
                                value={status}
                                className='w-100'
                                onChange={onChangeSelectType}
                                options={[
                                    {
                                        label: "Tất cả",
                                        value: ""
                                    },
                                    {
                                        label: "Gọi điện",
                                        value: "1"
                                    },
                                    {
                                        label: 'FB Messenger',
                                        value: '2',
                                    },
                                    {
                                        label: "Instagram",
                                        value: "3"
                                    },
                                    {
                                        label: 'Zalo',
                                        value: '4',
                                    },
                                    {
                                        label: 'Website',
                                        value: '5',
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
                                        value: "DESC"
                                    },
                                    {
                                        label: 'Thời gian tạo xa nhất',
                                        value: 'ASC',
                                    },
                                ]}
                            />
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