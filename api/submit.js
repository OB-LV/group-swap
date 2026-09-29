import { google } from 'googleapis'

const normalizeName = (name) =>
    name
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .sort()
        .join(' ')

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({
            success: false,
            message: 'Method not allowed.',
        })
    }

    try {
        const { fullName, currentGroup, desiredGroup } = request.body || {}

        if (!fullName?.trim()) {
            return response.status(400).json({
                success: false,
                message: 'Full name is required.',
            })
        }

        if (!['G1', 'G2', 'G3'].includes(currentGroup)) {
            return response.status(400).json({
                success: false,
                message: 'Invalid current group.',
            })
        }

        if (!['G1', 'G2', 'G3'].includes(desiredGroup)) {
            return response.status(400).json({
                success: false,
                message: 'Invalid desired group.',
            })
        }

        if (currentGroup === desiredGroup) {
            return response.status(400).json({
                success: false,
                message: 'Current and desired groups must be different.',
            })
        }

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

        const normalizedName = normalizeName(fullName)

        const duplicate = rows.slice(1).some((row) => {
            const existingName = row[2] || ''
            const existingStatus = row[5] || ''

            const normalizedExistingName = normalizeName(existingName)

            return (
                normalizedExistingName === normalizedName &&
                existingStatus === 'Pending'
            )
        })

        if (duplicate) {
            return response.status(409).json({
                success: false,
                message: 'You already have a pending swap request.',
            })
        }

        const timestamp = new Date().toISOString()

        const uniqueId = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Submissions!A:G',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        uniqueId,
                        timestamp,
                        fullName.trim().replace(/\s+/g, ' '),
                        currentGroup,
                        desiredGroup,
                        'Pending',
                        '',
                    ],
                ],
            },
        })

        return response.status(200).json({
            success: true,
            message: 'Swap request submitted successfully.',
            id: uniqueId,
        })
    } catch (error) {
        console.error('API ERROR:', error)

        return response.status(500).json({
            success: false,
            message: 'Failed to submit swap request.',
        })
    }
}