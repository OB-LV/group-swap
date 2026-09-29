import { useState } from 'react'
import './App.css'

function App() {
  const [fullName, setFullName] = useState('')
  const [currentGroup, setCurrentGroup] = useState('')
  const [desiredGroup, setDesiredGroup] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    setError('')
    setSuccess(false)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!currentGroup) {
      setError('Please select your current group.')
      return
    }

    if (!desiredGroup) {
      setError('Please select the group you want to swap to.')
      return
    }

    if (currentGroup === desiredGroup) {
      setError('You cannot swap to your current group.')
      return
    }

    setSuccess(true)

    setFullName('')
    setCurrentGroup('')
    setDesiredGroup('')

    setTimeout(() => {
      setSuccess(false)
    }, 4000)
  }

  return (
    <main className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Group Swap</h1>

          <p className="subtitle">
            Submit your group swap request
          </p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setError('')
              }}
              placeholder="Enter your full name"
            />
          </div>

          <div className="field">
            <label htmlFor="currentGroup">
              Current Group
            </label>

            <select
              id="currentGroup"
              value={currentGroup}
              onChange={(e) => {
                setCurrentGroup(e.target.value)

                if (e.target.value === desiredGroup) {
                  setDesiredGroup('')
                }

                setError('')
              }}
            >
              <option value="">
                Select your current group
              </option>

              <option value="G1">Group 1</option>
              <option value="G2">Group 2</option>
              <option value="G3">Group 3</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="desiredGroup">
              Desired Group
            </label>

            <select
              id="desiredGroup"
              value={desiredGroup}
              onChange={(e) => {
                setDesiredGroup(e.target.value)
                setError('')
              }}
            >
              <option value="">
                Select your desired group
              </option>

              <option
                value="G1"
                disabled={currentGroup === 'G1'}
              >
                Group 1
              </option>

              <option
                value="G2"
                disabled={currentGroup === 'G2'}
              >
                Group 2
              </option>

              <option
                value="G3"
                disabled={currentGroup === 'G3'}
              >
                Group 3
              </option>
            </select>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
          >
            Submit Swap Request
          </button>
        </form>
      </div>

      {success && (
        <div className="success-toast">
          <div className="success-icon">
            ✓
          </div>

          <div className="success-content">
            <strong>Request submitted</strong>

            <span>
              Your swap request has been recorded successfully.
            </span>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={() => setSuccess(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </main>
  )
}

export default App