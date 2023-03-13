import { Column } from '@ant-design/plots';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import axiosService from '../../utils/axios.config';
import { Skeleton, Card, DatePicker } from 'antd';
import moment from "moment"
import numeral from "numeral "
export default function QuarteRevenue() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true)
    const [year,setYear] = useState(moment(new Date()).format('YYYY'))
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const { data } = await axiosService(`reports/quarter?year=${year}`)
                if (data.code == 200) {
                    setData(data.data)
                    setIsLoading(false)
                } else {
                    console.log(data)
                    setIsLoading(false)
                    message.error("Lỗi lấy dữ liệu doanh số quý")
                }
            } catch (error) {
                console.error(error)
                message.error("Lỗi lấy dữ liệu doanh số quý")
                setIsLoading(false)
            }
        }
        fetchData()
    }, [year])
    const config = {
        data,
        isGroup: true,
        xField: 'quarter',
        yField: 'value',
        seriesField: 'type',
        yAxis: {
            label: {
                formatter: (v) => numeral(v).format('0a'),
            },
        },
        tooltip: {
            formatter: (data) => {
                return {
                    name: data.type,
                    value: `${data.value}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`)
                };
            },
        },
        label: {
            position: 'middle',
            formatter: (data) => numeral(data.value).format('0a,0.00'),
            layout: [
              {
                type: 'interval-adjust-position',
              }, 
              {
                type: 'interval-hide-overlap',
              },
              {
                type: 'adjust-color',
              },
            ],
          },
      };
    const onChange = (date, dateString)=>{
        setYear(dateString)
    }
    return (
        <Card title={`Doanh số các quý năm ${year}`} bordered={false}>
            <div className='mb-3 w-50'>
                <DatePicker onChange={onChange} picker="year" />
            </div>
            {isLoading ? <Skeleton active /> : <Column {...config} />}
        </Card>
    )
}