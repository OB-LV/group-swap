function SuccessMessage({ onReset }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-lg shadow-emerald-500/30">
                    ✓
                </div>
            </div>

            <p className="mt-7 text-sm font-medium uppercase tracking-widest text-emerald-400">
                Request received
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                You're on the list.
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-gray-400">
                Your swap request has been recorded. Matching will be handled
                automatically based on compatible requests and submission order.
            </p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                        🔒
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-200">
                            Your result is private
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Final swap results will be communicated separately.
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={onReset}
                className="mt-7 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
                Submit another request
            </button>
        </div>
    )
}

export default SuccessMessage