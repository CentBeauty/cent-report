import { useState, useEffect, useMemo } from "react"
import "../styles/login.style.css"
import axiosService from "../utils/axios.config";
import { message, Spin, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    let navigate = useNavigate();

    const onChangeEmail = (e) => {
        setEmail(e.target.value)
    }
    const onChangePassword = (e) => {
        setPassword(e.target.value)
    }

    useEffect(() => {
        document.title = 'Login page';
    }, []);
    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const payload = {
                "email": email,
                "password": password
            }
            const { data } = await axiosService("auth/login", "POST", payload)
            if (data.code === 200) {
                const { access_token, expiresIn } = data.data
                localStorage.setItem("access_token", access_token)
                localStorage.setItem("expiresIn", expiresIn)
                return navigate("/");
            } else {
                message.error("Đăng nhập thất bại")
                console.log(data.message)
                setIsLoading(false)
            }

        } catch (error) {
            message.error("Đăng nhập thất bại")
            console.log(error)
            setIsLoading(false)
        }
    }
    const onFinish = (values) => {
        handleSubmit()
    };
    return (
        <Spin spinning={isLoading} size="large" tip="Đang tải xin vui lòng chờ">
            <section className="h-100 gradient-form">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-xl-10">
                            <div className="card rounded-3 text-black">
                                <div className="row g-0">
                                    <div className="col-lg-6">
                                        <div className="card-body p-md-5 mx-md-4">
                                            <div className="text-center">
                                                <h4 className="mt-1 mb-5 pb-1">We are The Team</h4>
                                            </div>
                                            <Form
                                                name="basic"
                                                labelCol={{
                                                    span: 0,
                                                }}
                                                wrapperCol={{
                                                    span: 24,
                                                }}
                                                initialValues={{
                                                    remember: true,
                                                }}
                                                onFinish={onFinish}
                                                autoComplete="on"
                                                layout="vertical"
                                            >
                                                <Form.Item
                                                    label="Email"
                                                    name="email"
                                                    rules={[
                                                        {
                                                            type: 'email',
                                                            required: true,
                                                            message: 'Email không hợp lệ!',
                                                        },
                                                    ]}
                                                >
                                                    <Input onChange={onChangeEmail} />
                                                </Form.Item>

                                                <Form.Item
                                                    label="Mật khẩu"
                                                    name="password"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Vui lòng nhập mật khẩu!',
                                                        },
                                                    ]}
                                                >
                                                    <Input.Password onChange={onChangePassword} />
                                                </Form.Item>
                                                <Form.Item
                                                    wrapperCol={{
                                                        offset: 0,
                                                        span: 24,
                                                    }}
                                                >
                                                    <div className="text-center pt-1 mb-5 pb-1 w-100">
                                                        <button className="btn btn-block fa-lg gradient-custom-2 mb-3 w-100 text-white" type="submit">
                                                            Đăng nhập
                                                        </button>
                                                    </div>
                                                </Form.Item>
                                            </Form>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-right">
                                        <div className="d-flex align-items-center h-100 gradient-custom-2">
                                            <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                                                <h4 className="mb-4">We are more than just a company</h4>
                                                <img src="/logo-login.png" style={{ width: "100%" }} alt="logo" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Spin>
    )
}