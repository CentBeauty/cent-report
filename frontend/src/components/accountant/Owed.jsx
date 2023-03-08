
import { Pagination, Input, Select, Button, message, Spin, Tooltip, Drawer } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { Row, Col } from "react-bootstrap"
import { SearchOutlined, CloseOutlined, ProfileOutlined, MobileOutlined, MailOutlined, FilterOutlined } from '@ant-design/icons';
import axiosService from '../../utils/axios.config';
import currencyConvert from '../../utils/currency';
import moment from 'moment'
import datetimeDifference from "datetime-difference";
import Table from "ant-responsive-table";
import ExportXlsx from '../common/ExportXlsx';
export default function Owed() {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [total, setTotal] = useState(0)
    const [phone, setPhone] = useState("")
    const [order, setOrder] = useState("")
    const [range, setRange] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [sort, setSort] = useState("date_desc")
    const [sumOwed, setSumOwed] = useState(0)
    const [sum, setSum] = useState(0)
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
            dataIndex: 'customers',
            key: "customers",
            width: '30%',
            render: (x, record) => {
                return (
                    <>
                        <p><ProfileOutlined /> {x.full_name}</p>
                        <p><MobileOutlined /> {x.mobile || "Không có"}</p>
                        <p><MailOutlined /> {x.email || "Không có"}</p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Đơn hàng',
            width: '30%',
            dataIndex: "order",
            key: "order",
            render: (x, record) => {
                return (
                    <>
                        <p>Mã: {x.order_code}</p>
                        <p>Người lập: {x.created_name || "Không có thông tin"} </p>
                        <p>Giá trị: {currencyConvert(x.total_price | 0)} </p>
                        <p>Ngày đặt:  {moment(x.order_at).format('HH:mm, DD/MM/YYYY')}</p>
                        {x.description && x.description.length > 0 &&
                            <Tooltip title={x.description}>
                                <div className='hidden-text'>{x.description}</div>
                            </Tooltip>}
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Số tiền nợ',
            dataIndex: 'money_owed',
            key: "money_owed",
            with: "5%",
            sorter: (a, b) => a.money_owed - b.money_owed,
            render: (x, record) => {
                return (
                    <>
                        <p className='text-danger'>{currencyConvert(x | 0)} </p>

                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Thời gian nợ',
            dataIndex: 'order_at',
            key: "order_at",
            width: '10%',
            render: (x, record) => {
                const date1 = new Date(x);
                const date2 = new Date();
                const result = datetimeDifference(date1, date2);
                const { days, months, years } = result
                return (
                    <>
                        {
                            days === 0 ? <p>
                                1 ngày
                            </p>
                                :
                                <p>{`${years > 0 ? `${years} năm ` : ""} ${months > 0 ? `${months} tháng ` : ""} ${days > 0 ? `${days} ngày` : ""} `}</p>

                        }
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },
    ];
    const onChangePagination = async (page, pageSize) => {
        await getData(pageSize, page, phone, order, range)
        setPage(page)
        setLimit(pageSize)
        window.scrollTo(0, 0)
    }
    const onChangeSelect = (value) => {
        setRange(value)
    }
    const onChangePhone = (e) => {
        setPhone(e.target.value)
    }
    const onChangeOrder = (e) => {
        setOrder(e.target.value)
    }

    const handleFilter = async () => {
        await getData(limit, page, phone, order, range, sort)
    }
    const clearFilter = async () => {
        setOrder("")
        setRange("")
        setPhone("")
        setLimit(20)
        setPage(1)
        setSort("date_desc")
        await getData(20, 1, "", "", "", "date_desc")
    }
    const getData = async (limitFetch = 20, pageFetch = 1, phoneFetch = "", orderId = "", rangeDate = "", sortBy = "date_desc") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/owed?limit=${limitFetch}&page=${pageFetch}&mobile=${phoneFetch}&orderId=${orderId}&date=${rangeDate}&sortBy=${sortBy}`)
            if (res.data.code === 200) {
                const { items, meta, sumMoneyOwed, sumMoney } = res.data.data
                setData([...items])
                setTotal(meta.totalItems)
                setSum(sumMoney || 0)
                setSumOwed(sumMoneyOwed || 0)
                setIsLoading(false)
                onClose()
                return items
            } else {
                console.log(res)
                message.error(res.data.message)
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
    const onChangeSort = (value) => {
        setSort(value)
    }
    const handleExportData = async () => {
        const getDataFetch = await getData(total, 1, phone, order, range, sort)

        const dataEx = getDataFetch.map((x, i) => {
            var now = moment(new Date()); //todays date
            var end = moment(x.order_at); // another date
            var duration = moment.duration(now.diff(end));
            var days = duration.asDays();
            return {
                stt: i,
                customer: x.customers.full_name,
                order_code: x.order_code,
                price: x.total_price,
                days: Math.floor(days)
            }
        })
        return dataEx
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
                        <span>Thời gian nợ:</span>
                        <br></br>
                        <Select
                            value={range}
                            className='w-100'
                            onChange={onChangeSelect}
                            options={[
                                {
                                    label: 'Tất cả',
                                    value: '',
                                },
                                {
                                    label: '1 tháng',
                                    value: '1',
                                },
                                {
                                    label: '3 Tháng',
                                    value: '3',
                                },
                                {
                                    label: '6 tháng',
                                    value: '6',
                                },
                                {
                                    label: '9 tháng',
                                    value: '9',
                                },
                                {
                                    label: '12 tháng',
                                    value: '12',
                                },
                            ]}
                        />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <span>Sắp xếp theo:</span>
                        <br></br>
                        <Select
                            value={sort}
                            className='w-100'
                            onChange={onChangeSort}
                            options={[
                                {
                                    label: 'Thời gian tạo gần nhất',
                                    value: 'date_desc',
                                },
                                {
                                    label: 'Thời gian tạo xa nhất',
                                    value: 'date_asc',
                                },
                            ]}
                        />
                    </Col>
                    <Col xxl={12} xs={12} className="mt-2">
                        <div className='d-flex'>
                            <Button type="primary" className='me-2 w-100' icon={<SearchOutlined />} onClick={handleFilter}>
                                Tìm kiếm
                            </Button>
                            <Button onClick={clearFilter} className="w-100" type="primary" danger icon={<CloseOutlined />}>
                                Xoá
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Drawer>
            <Row className='mt-1'>
                <Col xs={12}>
                    <div className='d-flex justify-content-between mb-2'>
                        <Button type="primary" onClick={showDrawer} >
                            <FilterOutlined />
                        </Button>
                        <ExportXlsx handleExportData={handleExportData} />
                    </div>
                </Col>
                <Col xs={12} className="d-flex justify-content-end px-4">
                    <p>Hiển thị <span className='text-success fw-bold'>{data.length}</span> trên <span className='text-warning fw-bold'>{total}</span>.
                        Tổng số tiền nợ: <span className='text-danger'>{currencyConvert(sumOwed)}</span> .Tổng số: <span className='text-primary'>{currencyConvert(sum)}</span>
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