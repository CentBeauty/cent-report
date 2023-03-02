export default function currencyConvert(money =0){
    return (money ||0).toLocaleString('it-IT', { style: 'currency', currency: 'VND' })
}