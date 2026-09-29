import crypto from 'crypto'

const COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 60 * 60 * 8

const base64url = (value) => {
    return Buffer.from(value)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

const sign = (value) => {
    return crypto
        .createHmac('sha256', process.env.ADMIN_PASSWORD)
        .update(value)
        .digest('base64url')
}

export const createSession = () => {
    const payload = JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
    })

    const encodedPayload = base64url(payload)
    const signature = sign(encodedPayload)

    return `${encodedPayload}.${signature}`
}

export const isAuthenticated = (request) => {
    const cookieHeader = request.headers.cookie || ''

    const cookies = cookieHeader.split(';').reduce((result, cookie) => {
        const [key, ...value] = cookie.trim().split('=')

        if (key) {
            result[key] = value.join('=')
        }

        return result
    }, {})

    const session = cookies[COOKIE_NAME]

    if (!session) {
        return false
    }

    const [encodedPayload, signature] = session.split('.')

    if (!encodedPayload || !signature) {
        return false
    }

    const expectedSignature = sign(encodedPayload)

    if (
        !crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        )
    ) {
        return false
    }

    try {
        const payload = JSON.parse(
            Buffer.from(encodedPayload, 'base64url').toString()
        )

        return payload.exp > Math.floor(Date.now() / 1000)
    } catch {
        return false
    }
}

export const setSessionCookie = (response, session) => {
    response.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION}`
    )
}

export const clearSessionCookie = (response) => {
    response.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
    )
}