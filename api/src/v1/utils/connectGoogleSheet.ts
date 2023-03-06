import * as moment from 'moment';
const { GoogleSpreadsheet } = require('google-spreadsheet');
const SHEET_ID = '1GPbi7zoIgUMRoz4D5blhjvyMFuaYECo06wgzSLHgz7s';

async function connectGoogleSheet() {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SHEET_IMAIL,
        private_key: process.env.GOOGLE_SHEET_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
    return doc
}

async function addRowSheet(data:any) {
    try {
        const doc = await connectGoogleSheet()
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.addRows(data);
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export {
    addRowSheet
}