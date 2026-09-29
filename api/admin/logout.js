import { clearSessionCookie } from '../../lib/adminAuth.js'

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({
            success: false,
            message: 'Method not allowed.',
        })
    }

    clearSessionCookie(response)

    return response.status(200).json({
        success: true,
    })
}