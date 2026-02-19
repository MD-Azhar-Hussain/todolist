"use client"
import React,{useState} from 'react'

const page = () => {
  const [task, settask] = useState("")
  const [desc, setdesc] = useState("")
  const [mainTask, setmainTask] = useState([])

  const submitHandler = (e) =>{
    e.preventDefault()
    setmainTask([...mainTask , {task,desc}])
    setdesc("")
    settask("")
  }

  const deleteAllHandler = ()=>{
    setmainTask([])
  }


  const deleteHandler = (i) =>{
    let copytask = [...mainTask]
    copytask.splice(i,1)
    setmainTask(copytask)
  }
  let renderTask = <h2>Currently no Tasks</h2>

  if(mainTask.length > 0){
    renderTask = mainTask.map((t,i)=>{
      return (
        <li key={i} className='w-3/3 '>
        <div className='flex justify-between mb-5' >
          <h2 className='text-2xl font-semibold' >{t.task}</h2>
          <h4  className='text-lg font-medium' >{t.desc}</h4>
          <button className='bg-red-400 text-white py-2 px-4 font-bold rounded ' 
            onClick={()=>{
              deleteHandler(i);
            }}
          > 
            Delete
          </button>
        </div>
        </li>
        
      );
    })
  }
 

  return (
    <div>
      <h1 className='bg-neutral-900 text-white font-bold text-center p-5 text-4xl'>My List-of-Things</h1>
      <form onSubmit={submitHandler} className=' flex justify-center items-center'>
        <input 
        type='text'
          placeholder='Enter the Task'
          className='m-10 px-4 py-2 border-4 border-zinc-800 text-2xl rounded'
          value={task}
          onChange={(e)=>{
            settask(e.target.value)
          }}
        />
        <input 
          type='text'
          placeholder='Enter the Description'
          className='m-10 px-4 py-2 border-4 border-zinc-800 text-2xl rounded'
          value={desc}
          onChange={(e)=>{
            setdesc(e.target.value)
          }}
        />
        <button className='text-white bg-black font-bold text-2xl px-4 py-3 rounded'>
          Add This
        </button>
      </form>

      <hr />
      <div className='bg-slate-400 p-10 text-2xl font-bold text-center'>
          <ul>{renderTask}</ul>
      </div>
          
      {mainTask.length > 0 && (
        <div className='text-center'>
          <button 
            className='bg-red-500 text-white py-2 px-4 font-bold rounded mt-5'
            onClick={deleteAllHandler}
          >
            Delete All
          </button>
        </div>
      )}

    </div>
  )
}

export default page