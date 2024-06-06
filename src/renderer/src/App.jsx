import React, { useState } from 'react'
import DragAndDrop from './components/common/DragAndDrop'

function App() {
  // const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [files, setFiles] = useState([])

  return (
    <React.Fragment>
      <div className="layout-wrapper">
        <div className="main-content">
          <div className="">
            <DragAndDrop files={files} setFiles={setFiles} />
          </div>
        </div>
      </div>

    </React.Fragment>
  )
}

export default App
