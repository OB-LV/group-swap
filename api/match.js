import { google } from 'googleapis'
import { isAuthenticated } from '../lib/adminAuth.js'

const GROUPS = ['G1', 'G2', 'G3']
const MATCHES_SHEET = 'Matches'

const createMatchId = () => {
    return `M-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`
}

const ensureMatchesSheet = async (sheets, spreadsheetId) => {
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties',
    })

    const existingSheet = spreadsheet.data.sheets?.find(
        (sheet) =>
            sheet.properties?.title === MATCHES_SHEET
    )

    if (existingSheet) {
        return
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: MATCHES_SHEET,
                        },
                    },
                },
            ],
        },
    })

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${MATCHES_SHEET}!A1:I1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                'Match ID',
                'Match Time',
                'Type',
                'Student 1',
                'Student 1 Move',
                'Student 2',
                'Student 2 Move',
                'Student 3',
                'Student 3 Move',
            ]],
        },
    })
}

const updateSubmissionMatches = async (
    sheets,
    spreadsheetId,
    matches
) => {
    const updates = []

    for (const match of matches) {
        for (const request of match.requests) {
            updates.push({
                range: `Submissions!F${request.rowNumber}:G${request.rowNumber}`,
                values: [['Matched', match.matchId]],
            })
        }
    }

    if (updates.length === 0) {
        return
    }

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates,
        },
    })
}

const saveMatchResults = async (
    sheets,
    spreadsheetId,
    matches
) => {
    if (matches.length === 0) {
        return
    }

    await ensureMatchesSheet(
        sheets,
        spreadsheetId
    )

    const values = matches.map((match) => {
        const requests = match.requests

        const row = [
            match.matchId,
            match.matchTime,
            match.type,
        ]

        for (const request of requests) {
            row.push(request.fullName)
            row.push(
                `${request.currentGroup} → ${request.desiredGroup}`
            )
        }

        while (row.length < 9) {
            row.push('')
        }

        return row
    })

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${MATCHES_SHEET}!A:I`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values,
        },
    })
}

export default async function handler(request, response) {
    if (!isAuthenticated(request)) {
        return response.status(401).json({
            success: false,
            message: 'Unauthorized.',
        })
    }

    if (request.method !== 'POST') {
        return response.status(405).json({
            success: false,
            message: 'Method not allowed.',
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

        const pendingRequests = rows
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
            .filter(
                (request) =>
                    request.status === 'Pending' &&
                    GROUPS.includes(request.currentGroup) &&
                    GROUPS.includes(request.desiredGroup) &&
                    request.currentGroup !== request.desiredGroup
            )

        pendingRequests.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime()
            const timeB = new Date(b.timestamp).getTime()

            if (timeA !== timeB) {
                return timeA - timeB
            }

            return a.rowNumber - b.rowNumber
        })

        const available = [...pendingRequests]
        const matches = []

        while (available.length > 0) {
            const first = available.shift()

            if (!first) {
                break
            }

            const directCandidates = available.filter(
                (candidate) =>
                    candidate.currentGroup === first.desiredGroup &&
                    candidate.desiredGroup === first.currentGroup
            )

            if (directCandidates.length > 0) {
                const second = directCandidates[0]

                const secondIndex = available.findIndex(
                    (candidate) => candidate.id === second.id
                )

                available.splice(secondIndex, 1)

                matches.push({
                    matchId: createMatchId(),
                    matchTime: new Date().toISOString(),
                    type: 'Direct',
                    requests: [first, second],
                })

                continue
            }

            const middleGroup = GROUPS.find(
                (group) =>
                    group !== first.currentGroup &&
                    group !== first.desiredGroup
            )

            if (!middleGroup) {
                continue
            }

            const circularCandidates = []

            for (
                let secondIndex = 0;
                secondIndex < available.length;
                secondIndex++
            ) {
                const second = available[secondIndex]

                if (
                    second.currentGroup !== first.desiredGroup ||
                    second.desiredGroup !== middleGroup
                ) {
                    continue
                }

                for (
                    let thirdIndex = 0;
                    thirdIndex < available.length;
                    thirdIndex++
                ) {
                    if (thirdIndex === secondIndex) {
                        continue
                    }

                    const third = available[thirdIndex]

                    if (
                        third.currentGroup === middleGroup &&
                        third.desiredGroup === first.currentGroup
                    ) {
                        circularCandidates.push({
                            secondIndex,
                            thirdIndex,
                            second,
                            third,
                        })
                    }
                }
            }

            circularCandidates.sort((a, b) => {
                if (a.secondIndex !== b.secondIndex) {
                    return a.secondIndex - b.secondIndex
                }

                return a.thirdIndex - b.thirdIndex
            })

            if (circularCandidates.length === 0) {
                continue
            }

            const selected = circularCandidates[0]

            const indexes = [
                selected.secondIndex,
                selected.thirdIndex,
            ].sort((a, b) => b - a)

            for (const index of indexes) {
                available.splice(index, 1)
            }

            matches.push({
                matchId: createMatchId(),
                matchTime: new Date().toISOString(),
                type: 'Circular',
                requests: [
                    first,
                    selected.second,
                    selected.third,
                ],
            })
        }

        await updateSubmissionMatches(
            sheets,
            spreadsheetId,
            matches
        )

        await saveMatchResults(
            sheets,
            spreadsheetId,
            matches
        )

        const matchedRequests = matches.reduce(
            (total, match) =>
                total + match.requests.length,
            0
        )

        return response.status(200).json({
            success: true,
            message: 'Matching completed successfully.',
            matchedRequests,
            matches: matches.map((match) => ({
                matchId: match.matchId,
                type: match.type,
                matchTime: match.matchTime,
                requests: match.requests.map((request) => ({
                    id: request.id,
                    fullName: request.fullName,
                    currentGroup: request.currentGroup,
                    desiredGroup: request.desiredGroup,
                })),
            })),
            unmatchedRequests:
                pendingRequests.length -
                matchedRequests,
        })
    } catch (error) {
        console.error('MATCH API ERROR:', error)

        return response.status(500).json({
            success: false,
            message: 'Failed to run matching algorithm.',
        })
    }
}