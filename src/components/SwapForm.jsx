import { useState } from 'react'

function SwapForm() {
    const [fullName, setFullName] = useState('')
    const [currentGroup, setCurrentGroup] = useState('')
    const [desiredGroup, setDesiredGroup] = useState('')

    return (
        <div className="rounded-2xl bg-white p-6 shadow-xl">
            <div className="space-y-6">
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
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">Select your desired group</option>
                        <option value="G1" disabled={currentGroup === 'G1'}>
                            Group 1
                        </option>
                        <option value="G2" disabled={currentGroup === 'G2'}>
                            Group 2
                        </option>
                        <option value="G3" disabled={currentGroup === 'G3'}>
                            Group 3
                        </option>
                    </select>
                </div>

                <button
                    type="button"
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                    Submit Swap Request
                </button>
            </div>
        </div>
    )
}

export default SwapForm