import { useEffect, useState, useRef } from "react"
import { Spin, Pagination, DatePicker, Button, message, Select, Drawer } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ExportXlsx from '../common/ExportXlsx';
dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

export default function CountServiceKtv() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [startDate, setStartDate] = useState(dayjs().add(-7, 'd').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
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
            title: 'mã nv',
            dataIndex: 'name',
            key: "name",
            width: '33%',
            render: (x, record) => {
                return (<p>{x}</p>)
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'product_name',
            key: "product_name",
            width: '33%',
            render: (y, record) => {
                return (<p>{y}</p>)
            },
            showOnResponse: true,
            showOnDesktop: true
        },
        {
            title: 'Cơ sở',
            dataIndex: 'order',
            key: "order",
            width: '33%',
            render: (x, record) => {
                return (
                    <>
                        <p>{x.stores.name_store}</p>
                    </>
                )
            },
            showOnResponse: true,
            showOnDesktop: true
        },

    ];
    const rangePresets = [
        {
            label: 'Last 7 Days',
            value: [dayjs().add(-7, 'd'), dayjs()],
        },
        {
            label: 'Last 14 Days',
            value: [dayjs().add(-14, 'd'), dayjs()],
        },
        {
            label: 'Last 30 Days',
            value: [dayjs().add(-30, 'd'), dayjs()],
        },
        {
            label: 'Last 90 Days',
            value: [dayjs().add(-90, 'd'), dayjs()],
        },
    ];
    const getData = async (limitFetch = 20, pageFetch = 1, start = "", end = "", sort = "date_desc") => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/count-service-ktv?page=${pageFetch}&limit=${limitFetch}&startDate=${start}&endDate=${end}&sortBy=${sort}`)
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
        setPage(page)
        setLimit(pageSize)
        await getData(pageSize, page, startDate, endDate, sortBy)
        window.scrollTo(0, 0)
    }
    const handleFilter = async () => {
        await getData(limit, page, startDate, endDate, sortBy)
    }
    const clearFilter = async () => {
        setLimit(20)
        setPage(1)
        setStartDate("")
        setEndDate("")
        setSortBy("date_desc")
        await getData(20, 1, "", "", "date_desc")
    }
    const onChangeDate = (x, y) => {
        setStartDate(y[0])
        setEndDate(y[1])
    }
    const onChangeSelectSortBy = (value) => {
        setSortBy(value)
    }
    useEffect(() => {
        async function fetchData() {
            await getData(limit, page, startDate, endDate, sortBy)
        }
        fetchData()
    }, [])
    const handleExportData = async () => {
        setIsLoading(true)
        try {
            const res = await axiosService(`reports/accountant/count-service-ktv?page=${1}&limit=${total}&startDate=${startDate}&endDate=${endDate}&sortBy=${sortBy}`)
            if (res.data.code === 200) {
                setIsLoading(false)
                const mapData = res.data.data.items.map((x, i) => {
                    return {
                        stt: i,
                        ktv_ids: x.name,
                        service: x.product_name,
                        store: x.order?.stores.name_store
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
                    <Col xxl={12} xs={12} >
                        <span>Khoảng thời gian:</span>
                        <br></br>
                        <RangePicker presets={rangePresets} className="w-100" onChange={onChangeDate}
                            defaultValue={[dayjs().add(-7, 'd'), dayjs()]}
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