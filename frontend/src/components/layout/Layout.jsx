import React, { useEffect } from 'react';
import { Layout, theme, Avatar, Dropdown, message } from 'antd';
const { Content, Header } = Layout;
import BreadcrumbComponent from './BreadCrumb';
import BackToTp from '../common/BackTop';
import {
  UserOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import './main.css';
import { useNavigate } from "react-router-dom";
import axiosService from "../../utils/axios.config";
import { useSelector, useDispatch } from 'react-redux'
import { getData } from '../../redux/reducers/user';
import linkEnum from '../../enums/link.enum';
import MobileMenu from '../menu/Mobile';
import DesktopMenu from '../menu/Desktop';

export default function LayoutComponent({ children }) {
  let navigate = useNavigate();
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  useEffect(() => {
    let expiresIn = localStorage.getItem("expiresIn")
    if (expiresIn) {
      expiresIn = new Date(expiresIn).getTime()
      if (expiresIn < new Date().getTime()) {
        localStorage.clear()
        return navigate(linkEnum.LOGIN_PAGE)
      } else {
        dispatch(getData()).catch(err => {
          console.error(err)
          message.error("Không thể lấy dữ liệu người dùng")
        }).then(rs => {
          // console.log(rs)
        })
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      const { data, status } = await axiosService("auth/logout", "post")
      if (data == "OK" && status === 200) {
        localStorage.clear()
        return navigate(linkEnum.LOGIN_PAGE)
      } else {
        message.error("Đăng xuất thất bại")
      }
    } catch (error) {
      console.error(error)
      message.error("Đăng xuất thất bại")
    }
  }
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const itemsDrop = [
    {
      key: '1',
      label: (
        <div className='d-flex' onClick={handleLogout}>
          <ArrowRightOutlined className="mt-1 mr-1" />
          <span className='w-100'>
            Đăng xuất
          </span>
        </div>
      ),
    },
  ];
  return (
    <>
      <Layout
        style={{
          minHeight: '100vh',
        }}
      >
        <DesktopMenu />
        <Layout className="site-layout">
          <Header
            style={{
              background: colorBgContainer,
            }}
            className="pt-3 px-5 box"
          >
            <div>

            </div>
            <div className='d-flex justify-content-end w-100 mx-0'>
              <Dropdown
                menu={{
                  items: itemsDrop,
                }}
                placement="bottom"
                arrow
                style={{ width: "300px" }}
              >
                <Avatar size="large" className="shadow-avatar" icon={<UserOutlined />} src={user.data.avatar_url ? user.data.avatar_url : "https://joesch.moe/api/v1/random"} />
              </Dropdown>
            </div>
          </Header>
          <Content className='m-2'>
            {/* <BreadcrumbComponent /> */}
            {children}
          </Content>
          <MobileMenu />
        </Layout>
      </Layout>
      <BackToTp />
    </>
  );
}
