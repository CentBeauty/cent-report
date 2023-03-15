import { Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Owed from '../components/accountant/Owed';
import { useSearchParams, useNavigate } from 'react-router-dom';
import linkEnum from '../enums/link.enum';
import "../styles/accountant.style.css"
import Announce from '../components/accountant/AnnouncePackage';
import CustomerPackage from '../components/accountant/CustomerPackage';
import ActiveCustomer from '../components/accountant/ActiveCustomer';
import Discount from '../components/accountant/Discount';
import Collection from '../components/accountant/Collection'
import CountServiceKtv from '../components/accountant/CountServiceKtv';
import PackageNotUse from '../components/accountant/PackageNotUse';
import CustomerPaid from '../components/accountant/CustomerPaid';
import Customer from '../components/accountant/Customer';
import ReceiptCate from '../components/accountant/ReceiptCate';
import PackageNumber from '../components/accountant/PakcageNumber';
import CustomerPackageYear from '../components/accountant/CustomerPackageYear';
import CustomerPackageMonth from '../components/accountant/CustomerPackageMonth';
export default function AccountantPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [keyTab, setKey] = useState(parseInt(searchParams.get('key')) || 1)

    const onChange = (key) => {
        setKey(parseInt(key))
        navigate({
            pathname: linkEnum.ACCOUNTANT_PAGE,
            search: `?key=${key}`,
        });
    };

    const items = [
        {
            key: 1,
            label: ` Tuổi nợ của khách hàng`,
            children: <Owed />,
        },

        {
            key: 2,
            label: `Khách hàng sử dụng dịch vụ`,
            children: <Announce />,
        },
        {
            key: 3,
            label: `Khách hàng đã sử dụng`,
            children: <CustomerPackage />,
        },
        {
            key: 4,
            label: `Bình quân / khách hàng`,
            children: <ActiveCustomer />,
        },
        {
            key: 5,
            label: `Chiết khấu`,
            children: <Discount />,
        },
        {
            key: 6,
            label: `Thu tiền`,
            children: <Collection />,
        },
        {
            key: 7,
            label: `Dịch vụ theo từng KTV`,
            children: <CountServiceKtv />,
        },
        {
            key: 8,
            label: `Doanh thu chưa thực hiện`,
            children: <PackageNotUse />,
        },
        {
            key: 9,
            label: `Phải thu khách hàng`,
            children: <CustomerPaid />,
        },
        {
            key: 10,
            label: `Bảng tổng hợp về khách hàng `,
            children: <Customer />,
        },
        {
            key: 11,
            label: `Doanh số nhóm dịch vụ`,
            children: <ReceiptCate />,
        },
        {
            key: 12,
            label: `Số lượng thẻ dịch vụ`,
            children: <PackageNumber />,
        },
        {
            key: 13,
            label: `Số lượng khách hàng sử dụng dịch vụ`,
            children: <CustomerPackageYear />,
        },
        {
            key: 14,
            label: `Số lượng khách hàng sử dụng dịch vụ trong tháng `,
            children: <CustomerPackageMonth />,
        },
    ];
    
    useEffect(() => {
        document.title = items[keyTab-1].label
    }, [keyTab])

    return (

        <Container fluid className='box-container'>
            <Row>
                <Col xs={12}>
                    <div>
                        <Tabs type="card" activeKey={keyTab}  items={items} onChange={onChange} />
                    </div>
                </Col>
            </Row>
        </Container>
    )
}