
import { google } from 'googleapis'
import { isAuthenticated } from '../../lib/adminAuth.js'

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({
            success: false,
            message: 'Method not allowed.',
        })
    }

    if (!isAuthenticated(request)) {
        return response.status(401).json({
            success: false,
            message: 'Unauthorized.',
        })
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        })

        const sheets = google.sheets({
            version: 'v4',
            auth,
        })

        const spreadsheetId = process.env.GOOGLE_SHEET_ID

        const values = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Submissions!A:G',
        })

        const rows = values.data.values || []

        const submissions = rows
            .slice(1)
            .map((row, index) => ({
                id: row[0] || '',
                timestamp: row[1] || '',
                fullName: row[2] || '',
                currentGroup: row[3] || '',
                desiredGroup: row[4] || '',
                status: row[5] || '',
                matchId: row[6] || '',
                rowNumber: index + 2,
            }))

        return response.status(200).json({
            success: true,
            submissions,
        })
    } catch (error) {
        console.error('ADMIN DATA ERROR:', error)

        return response.status(500).json({
            success: false,
            message: 'Failed to load submissions.',
        })
    }
}