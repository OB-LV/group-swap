import { useState } from 'react'

function App() {
  const [fullName, setFullName] = useState('')
  const [currentGroup, setCurrentGroup] = useState('')
  const [desiredGroup, setDesiredGroup] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log({
      fullName,
      currentGroup,
      desiredGroup,
    })
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Group Swap
          </h1>

          <p className="mt-2 text-gray-500">
            Submit your group swap request
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="currentGroup"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Current Group
              </label>

              <select
                id="currentGroup"
                value={currentGroup}
                onChange={(e) => setCurrentGroup(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
              >
                <option value="">Select your current group</option>
                <option value="G1">Group 1</option>
                <option value="G2">Group 2</option>
                <option value="G3">Group 3</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="desiredGroup"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Desired Group
              </label>

              <select
                id="desiredGroup"
                value={desiredGroup}
                onChange={(e) => setDesiredGroup(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
              >
                <option value="">Select your desired group</option>
                <option value="G1">Group 1</option>
                <option value="G2">Group 2</option>
                <option value="G3">Group 3</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default App