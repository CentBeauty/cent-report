
import {
    HomeOutlined,
    PayCircleOutlined,
    SolutionOutlined,
    PhoneOutlined,
    MenuOutlined
} from '@ant-design/icons';
import React, { useMemo, useState } from 'react';
import linkEnum from '../../enums/link.enum';
import { Layout, Menu } from 'antd';
const { Sider } = Layout;
import { useNavigate } from "react-router-dom";
import { useLocation, useParams } from 'react-router-dom';
import { getRoutePath } from '../../hooks/useCurrentPath ';
export default function DesktopMenu() {
    let navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const path = getRoutePath(location, params);
    const [collapsed, setCollapsed] = useState(false);
    function getItem(label, key, icon, children, type) {
        return {
            key,
            icon,
            children,
            label,
            type,
        };
    }
    const items = [
        getItem('Trang chủ', linkEnum.HOME_PAGE, <HomeOutlined />),
        getItem('Booking', linkEnum.BOOKING_PAGE, <MenuOutlined />),
        getItem('Kế toán', linkEnum.ACCOUNTANT_PAGE, <PayCircleOutlined />),
        getItem('Marketing', linkEnum.MARKETING_PAGE, <SolutionOutlined />),
        getItem('Sale', linkEnum.SALE_PAGE, <PhoneOutlined />,),
    ];
    const handleRedirect = (link) => {
        return navigate(link)
    }
    return (
        <Sider  collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className="mobile">
            {collapsed ? <div className='logo'></div> : <img style={{ cursor: "pointer" }} src='/logo.png' className='logo' onClick={() => { handleRedirect(linkEnum.HOME_PAGE) }} />}
            <Menu theme="dark" className='menu-desktop' defaultSelectedKeys={[path]} mode="inline" items={items} onSelect={(e) => {
                const { key } = e
                handleRedirect(key)
            }} />
        </Sider>
    )
}