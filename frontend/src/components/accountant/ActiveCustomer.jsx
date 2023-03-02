import { useEffect, useState } from "react"
import { Spin, Pagination, Input, Select, Button, message, Tag } from "antd"
import { Row, Col } from "react-bootstrap"
import Table from "ant-responsive-table";
import axiosService from "../../utils/axios.config";
import { SearchOutlined, CloseOutlined, ProfileOutlined, MobileOutlined } from '@ant-design/icons';
import currencyConvert from '../../utils/currency';
export default function ActiveCustomer() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [phone, setPhone] = useState("")
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
    return (
        <Spin tip="Đang tải. Xin vui lòng chờ" size="large" spinning={isLoading}>
            <Row>
                <Col xxl={6} xs={12}>
                    <span>Số điện thoại:</span>
                    <Input onChange={onChangePhone} placeholder="Nhập số điện thoại khách hàng" value={phone} />
                </Col>
                <Col xxl={6} xs={12} >
                    <span></span>
                    <br></br>
                    <div className='d-flex'>
                        <Button type="primary" className='mx-2' icon={<SearchOutlined />} onClick={handleFilter}>
                            Tìm kiếm
                        </Button>
                        <Button onClick={clearFilter} type="primary" danger icon={<CloseOutlined />}>
                            Xoá
                        </Button>
                    </div>
                </Col>
            </Row>
            <Row className='mt-5'>
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
                            pagination: false
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