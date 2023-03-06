import { constant } from "lodash"

export const orderStatusOject = {
    1:"Đang xử lý",
    2:"Bị huỷ",
    3:"Hoàn thành",
}

export const typeProduct = {
    1:"Dịch vụ",
    2:"Thẻ dịch vụ",
    3:"Sản phẩm",
}


export const defaultExprotOrder = {
    order_code: "Mã hóa đơn", 
    order_at: "Ngày tạo hóa đơn",
    customer_name: "Tên khách hàng",
    customer_mobile: "Số điện thoại",
    customer_code: "Mã KH",
    customer_new_old: "Khách mới/khách quay lại",
    group_cutomer: "Nhóm KH",
    source_from: "Nguồn đặt lịch",
    status: "Trạng thái",
    total_price_before: "Tổng tiền trước giảm giá",
    discount_by_total_bill: "Giảm giá",
    price_point: "Đổi điểm thành tiền",
    discount_by_rule: "Voucher",
    total_price: "Tổng tiền đơn hàng",
    total_sales: "Tổng doanh số",
    money_owed: "Còn nợ",
    pay_money : "Thu bằng Tiền mặt",
    pay_banking:"Thu bằng Chuyển khoản",
    pay_card: "Thu bằng Quẹt thẻ",
    pay_electronic: "Thu bằng Ví điện tử",
    cod: "Thu bằng Ship COD",
    deposit_total: "Thanh toán bằng thẻ cọc",
    update_name: "Nhân viên thu ngân",
    create_name:"Nhân viên Đặt lịch",
    // count_customer: "Số khách hàng đi nhóm",
    voucher_code: "Mã voucher sử dụng",
    points: "Điểm thưởng được nhận",
    note: "Gi chú"
}

export const defaultExportOrderDetail = { 
    customer_name: "Khách hàng", 
    customer_mobile: "Số điện thoại",
    order_first_at: "Ngày mua lần đầu",
    product_name: "Dịch vụ & sản phẩm",
    order_code: "Mã đơn hàng mua",
    order_code_using: "Mã đơn hàng sửa dụng",
    by_date: "Thời gian mua",
    quantity: "Số lượng mua",
    quantity_using: "Số lượng sử dụng",
    total_price: "Doanh thu sau khi giảm giá",
}

export const exportPackageDetail = { 
    stt: "STT", 
    customer_name: "Tên khách",
    customer_mobile: "Số điện thoại",
    package_date: "Ngày mua dịch vụ",
    package_code: "Mã thẻ",
    package_name: "Tên dịch vụ",
    order_code: "Mã đơn hàng mua",
    total_bill: "Doanh số bill",
    paid_mony: "Đã trả",
    owed_mony: "Còn phải trả",
    max_use: "Số buổi theo bill được dùng",
    use_mony: "Số buổi theo số tiên đã trả được dùng",
    count_use: "Số buổi đã dùng",
    residual_use: "Số buổi còn dư ( số buổi theo tiền đc trả- số buổi đã dùng)"
}

export const exportCustomer = { 
    stt: "STT", 
    customer_name: "Tên khách",
    customer_mobile: "Số điện thoại",
    store: "Cơ sở"
}