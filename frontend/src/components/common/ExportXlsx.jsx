import * as XLSX from 'xlsx';
import { VerticalLeftOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
export default function ExportXlsx({ handleExportData, handleLoading }) {
    const handleExport = async () => {
        const data = await handleExportData()
        if (data.length > 0) {
            const wb = XLSX.utils.book_new()

            const ws = XLSX.utils.json_to_sheet(data)

            XLSX.utils.book_append_sheet(wb, ws, "sheet1")

            XLSX.writeFile(wb, "file.xlsx")
        } else {
            message.error("Không có dữ liệu để xuất")
        }
    }
    
    return (
        <Button type="primary" style={{ backgroundColor: "green" }} onClick={handleExport} >
            <VerticalLeftOutlined /> <span>Xuất dữ liệu</span>
        </Button>
    )
}