import { Row, Col } from "react-bootstrap";
import { Tag, message, Skeleton } from "antd";
import axiosService from '../../utils/axios.config';
import { useState, useEffect } from "react";
import numeral from "numeral "
export default function HeaderDashBoard() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const { data } = await axiosService(`reports/header`)
                if (data.code == 200) {
                    setData(data.data)
                    setIsLoading(false)
                } else {
                    console.log(data)
                    setIsLoading(false)
                    message.error("Lỗi lấy dữ các tag")
                }
            } catch (error) {
                console.error(error)
                message.error("Lỗi lấy dữ các tag")
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])
    return (
        <>
            {isLoading ?
            <Skeleton active />
            :
            <Row>
                <Col xxl={3} className="mt-1">
                    <Tag color="#f50" className="w-100 h-100">
                        <div className="d-flex justify-content-start">
                            <h6 className="me-2 mt-1">Doanh số dự kiến:</h6>
                        </div>
                        <div className="d-flex justify-content-end">
                            <h5>{numeral(data?.expectRevenue || 0).format('0,0')} VNĐ</h5>
                        </div>
                    </Tag>
                </Col>
                <Col xxl={3} className="mt-1">
                    <Tag color="#2db7f5" className="w-100">
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Doanh thu tuần:</h6><h5>{numeral(data?.receipt || 0).format('0,0')} VNĐ</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Tiền chuyển khoản/quẹt thẻ:</h6><h5>{numeral(data?.paySwipe || 0).format('0,0')} VNĐ</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Tiền thu nợ:</h6><h5>{numeral(data?.owed || 0).format('0,0')} VNĐ</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Tiền mặt:</h6><h5>{numeral(data?.payByCash || 0).format('0,0')} VNĐ</h5>
                        </div>
                    </Tag>
                </Col>
                <Col xxl={3} className="mt-1">
                    <Tag color="#87d068" className="w-100">
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Tổng số lịch:</h6><h5>{data?.bookings?.total || 0}</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Tổng số lịch huỷ:</h6><h5>{data?.bookings?.cancel || 0}</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Tổng số lịch hoàn thành:</h6><h5>{data?.bookings?.done || 0}</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Tổng số lịch khách không đến:</h6><h5>{data?.bookings?.notCome || 0}</h5>
                        </div>
                    </Tag>
                </Col>
                <Col xxl={3} className="mt-1">
                    <Tag color="#108ee9" className="w-100 h-100">
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Số đơn hàng:</h6><h5>{data?.orders || 0}</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Nợ chưa thu:</h6><h5>{numeral(data?.sumOwedToday || 0).format('0,0')} VNĐ</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                            <h6 className="me-2 mt-1">Số khách hàng mới:</h6><h5>{data?.newCustomer || 0}</h5>
                        </div>
                    </Tag>
                </Col>
            </Row>}
        </>

    )
}