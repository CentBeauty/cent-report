import {
    AppOutline,
    MessageOutline,
    CalculatorOutline,
    UserContactOutline,
} from 'antd-mobile-icons'
import { Badge, TabBar } from 'antd-mobile'
import linkEnum from '../../enums/link.enum';
import { useNavigate,useLocation,useParams } from "react-router-dom";
import { getRoutePath } from '../../hooks/useCurrentPath ';
export default function MobileMenu() {
    let navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const path = getRoutePath(location, params);
    const tabs = [
        {
            key: linkEnum.HOME_PAGE,
            title: 'Trang chủ',
            icon: <AppOutline />,
            badge: Badge.dot,
        },
        {
            key: linkEnum.ACCOUNTANT_PAGE,
            title: 'Kế toán',
            icon: <CalculatorOutline />,
            badge: '5',
        },
        {
            key: linkEnum.MARKETING_PAGE,
            title: 'Marketing',
            icon: <UserContactOutline />,
        },
        {
            key: linkEnum.SALE_PAGE,
            title: 'Sale',
            icon: <MessageOutline />,
        },
    ];
    const handleRedirect = (link) => {
        return navigate(link)
    }
    return (
        <div className='desktop box'>
            <TabBar onChange={(e)=>{
                handleRedirect(e)
            }} activeKey={path}>
                {tabs.map(item => (
                    <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                ))}
            </TabBar>
        </div>
    )
}