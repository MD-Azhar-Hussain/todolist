"use client"
import React, { useState } from 'react'

const page = () => {
  const [task, settask] = useState("")
  const [desc, setdesc] = useState("")
  const [mainTask, setmainTask] = useState([])

  const submitHandler = (e) => {
    e.preventDefault()
    if (!task.trim()) return
    setmainTask([...mainTask, { task, desc, done: false }])
    setdesc("")
    settask("")
  }

  const deleteAllHandler = () => {
    setmainTask([])
  }

  const deleteHandler = (i) => {
    let copytask = [...mainTask]
    copytask.splice(i, 1)
    setmainTask(copytask)
  }

  const toggleDone = (i) => {
    let copytask = [...mainTask]
    copytask[i] = { ...copytask[i], done: !copytask[i].done }
    setmainTask(copytask)
  }

  const pending = mainTask.filter(t => !t.done).length
  const completed = mainTask.filter(t => t.done).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My To-Do List</h1>
            <p className="text-indigo-200 text-sm mt-1">Stay organised, stay productive</p>
          </div>
          {mainTask.length > 0 && (
            <div className="flex gap-3 text-sm font-semibold">
              <span className="bg-white/20 text-white rounded-full px-3 py-1">{pending} pending</span>
              <span className="bg-green-400/80 text-white rounded-full px-3 py-1">{completed} done</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Add Task Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Add a new task</h2>
          <form onSubmit={submitHandler} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Task title *"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-400 transition-colors"
              value={task}
              onChange={(e) => settask(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-400 transition-colors"
              value={desc}
              onChange={(e) => setdesc(e.target.value)}
            />
            <button
              type="submit"
              disabled={!task.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-95"
            >
              + Add Task
            </button>
          </form>
        </div>

        {/* Task List */}
        {mainTask.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg font-medium">No tasks yet — add one above!</p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {mainTask.map((t, i) => (
                <li
                  key={i}
                  className={`bg-white rounded-2xl shadow-sm border-l-4 px-5 py-4 flex items-start gap-4 transition-all duration-200 ${
                    t.done ? 'border-green-400 opacity-70' : 'border-indigo-400'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDone(i)}
                    className={`mt-1 w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                      t.done ? 'bg-green-400 border-green-400 text-white' : 'border-gray-300 hover:border-indigo-400'
                    }`}
                    aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {t.done && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-gray-800 break-words ${t.done ? 'line-through text-gray-400' : ''}`}>
                      {t.task}
                    </p>
                    {t.desc && (
                      <p className={`text-sm mt-0.5 break-words ${t.done ? 'text-gray-300' : 'text-gray-500'}`}>
                        {t.desc}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteHandler(i)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors duration-200"
                    aria-label="Delete task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* Delete All */}
            <div className="text-center mt-6">
              <button
                onClick={deleteAllHandler}
                className="text-sm text-red-400 hover:text-red-600 font-semibold underline underline-offset-2 transition-colors duration-200"
              >
                Clear all tasks
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default page