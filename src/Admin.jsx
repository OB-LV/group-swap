import { useEffect, useState } from 'react'
import './Admin.css'

function Admin() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [submissions, setSubmissions] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [matching, setMatching] = useState(false)

    const loadData = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/admin/data', {
                credentials: 'include',
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    setAuthenticated(false)
                }

                setError(data.message || 'Failed to load data.')
                return
            }

            setSubmissions(data.submissions || [])
            setAuthenticated(true)
        } catch {
            setError('Unable to connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let cancelled = false

        const checkAuthentication = async () => {
            try {
                const response = await fetch('/api/admin/data', {
                    credentials: 'include',
                })

                const data = await response.json()

                if (cancelled) {
                    return
                }

                if (!response.ok) {
                    setAuthenticated(false)
                    return
                }

                setSubmissions(data.submissions || [])
                setAuthenticated(true)
            } catch {
                if (!cancelled) {
                    setError('Unable to connect to the server.')
                }
            }
        }

        checkAuthentication()

        return () => {
            cancelled = true
        }
    }, [])

    const handleLogin = async (event) => {
        event.preventDefault()

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ password }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Login failed.')
                return
            }

            setPassword('')
            await loadData()
        } catch {
            setError('Unable to connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await fetch('/api/admin/logout', {
            method: 'POST',
            credentials: 'include',
        })

        setAuthenticated(false)
        setSubmissions([])
    }

    const handleMatching = async () => {
        setMatching(true)
        setError('')

        try {
            const response = await fetch('/api/match', {
                method: 'POST',
                credentials: 'include',
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Matching failed.')
                return
            }

            await loadData()
        } catch {
            setError('Unable to run matching.')
        } finally {
            setMatching(false)
        }
    }

    const escapeCsv = (value) => {
        const stringValue = String(value ?? '')

        return `"${stringValue.replace(/"/g, '""')}"`
    }

    const downloadCsv = (filename, headers, rows) => {
        const csvContent = [
            headers.map(escapeCsv).join(','),
            ...rows.map((row) =>
                row.map(escapeCsv).join(',')
            ),
        ].join('\n')

        const blob = new Blob(
            ['\uFEFF' + csvContent],
            {
                type: 'text/csv;charset=utf-8;',
            }
        )

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()

        URL.revokeObjectURL(url)
    }

    const exportSubmissions = () => {
        const headers = [
            'ID',
            'Timestamp',
            'Full Name',
            'Current Group',
            'Desired Group',
            'Status',
            'Match ID',
        ]

        const rows = submissions.map((submission) => [
            submission.id,
            submission.timestamp,
            submission.fullName,
            submission.currentGroup,
            submission.desiredGroup,
            submission.status,
            submission.matchId,
        ])

        downloadCsv(
            'group-swap-submissions.csv',
            headers,
            rows
        )
    }

    const exportMatches = () => {
        const matches = new Map()

        submissions.forEach((submission) => {
            if (!submission.matchId) {
                return
            }

            if (!matches.has(submission.matchId)) {
                matches.set(submission.matchId, {
                    matchId: submission.matchId,
                    students: [],
                })
            }

            matches.get(submission.matchId).students.push(
                submission
            )
        })

        const headers = [
            'Match ID',
            'Student 1',
            'Student 1 Move',
            'Student 2',
            'Student 2 Move',
            'Student 3',
            'Student 3 Move',
        ]

        const rows = []

        matches.forEach((match) => {
            const students = match.students

            const row = [match.matchId]

            students.forEach((student) => {
                row.push(student.fullName)
                row.push(
                    `${student.currentGroup} → ${student.desiredGroup}`
                )
            })

            while (row.length < headers.length) {
                row.push('')
            }

            rows.push(row)
        })

        downloadCsv(
            'group-swap-matches.csv',
            headers,
            rows
        )
    }

    if (!authenticated) {
        return (
            <main className="admin-page">
                <div className="admin-login">
                    <h1>Admin Dashboard</h1>
                    <p>Sign in to manage group swap requests.</p>

                    <form onSubmit={handleLogin}>
                        <label htmlFor="admin-password">
                            Admin Password
                        </label>

                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value)
                                setError('')
                            }}
                            placeholder="Enter admin password"
                            disabled={loading}
                        />

                        {error && (
                            <div className="admin-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </main>
        )
    }

    const pending = submissions.filter(
        (item) => item.status === 'Pending'
    ).length

    const matched = submissions.filter(
        (item) => item.status === 'Matched'
    ).length

    const unmatched = submissions.filter(
        (item) => item.status === 'Unmatched'
    ).length

    return (
        <main className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <div>
                        <h1>Group Swap Admin</h1>
                        <p>Manage student swap requests</p>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </header>

                <section className="admin-stats">
                    <div className="stat-card">
                        <span>Total</span>
                        <strong>{submissions.length}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Pending</span>
                        <strong>{pending}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Matched</span>
                        <strong>{matched}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Unmatched</span>
                        <strong>{unmatched}</strong>
                    </div>
                </section>

                <section className="admin-actions">
                    <button
                        onClick={handleMatching}
                        disabled={matching || loading}
                    >
                        {matching
                            ? 'Running Matching...'
                            : 'Run Matching'}
                    </button>

                    <button
                        onClick={loadData}
                        disabled={loading || matching}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>

                    <button
                        onClick={exportSubmissions}
                        disabled={
                            loading ||
                            matching ||
                            submissions.length === 0
                        }
                    >
                        Export Submissions CSV
                    </button>

                    <button
                        onClick={exportMatches}
                        disabled={
                            loading ||
                            matching ||
                            matched === 0
                        }
                    >
                        Export Matches CSV
                    </button>
                </section>

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}

                <section className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Timestamp</th>
                                <th>Full Name</th>
                                <th>Current</th>
                                <th>Desired</th>
                                <th>Status</th>
                                <th>Match ID</th>
                            </tr>
                        </thead>

                        <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission.id}>
                                    <td>{submission.id}</td>

                                    <td>
                                        {new Date(
                                            submission.timestamp
                                        ).toLocaleString()}
                                    </td>

                                    <td>{submission.fullName}</td>

                                    <td>{submission.currentGroup}</td>

                                    <td>{submission.desiredGroup}</td>

                                    <td>
                                        <span
                                            className={`status status-${submission.status.toLowerCase()}`}
                                        >
                                            {submission.status}
                                        </span>
                                    </td>

                                    <td>
                                        {submission.matchId || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {submissions.length === 0 && (
                        <div className="empty-state">
                            No submissions yet.
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default Admin