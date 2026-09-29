import { createSession, setSessionCookie } from '../../lib/adminAuth.js'

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({
            success: false,
            message: 'Method not allowed.',
        })
    }

    try {
        const { password } = request.body || {}

        if (!password) {
            return response.status(400).json({
                success: false,
                message: 'Password is required.',
            })
        }

        if (password !== process.env.ADMIN_PASSWORD) {
            return response.status(401).json({
                success: false,
                message: 'Invalid password.',
            })
        }

        const session = createSession()

        setSessionCookie(response, session)

        return response.status(200).json({
            success: true,
            message: 'Login successful.',
        })
    } catch (error) {
        console.error('ADMIN LOGIN ERROR:', error)

        return response.status(500).json({
            success: false,
            message: 'Login failed.',
        })
    }
}