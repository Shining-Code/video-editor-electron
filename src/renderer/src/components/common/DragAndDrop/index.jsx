import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Form, Input, Button } from 'antd'
import CloseIcon from '../../icons/CloseIcon'
import { DeleteTwoTone } from '@ant-design/icons'
import PerfectScrollbar from 'react-perfect-scrollbar'
const { Item: FormItem } = Form

const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
const secondsToHms = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`
}
const hmsToSeconds = (hms) => {
  const [h, m, s] = hms.split(':').map(Number)
  return h * 3600 + m * 60 + s
}
function DragAndDrop() {
  // drag state
  const [dragActive, setDragActive] = React.useState(false)
  const [key, setKey] = React.useState('')
  // ref
  const inputRef = React.useRef(null)

  // handle drag events
  const handleDrag = function (e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // triggers when file is dropped
  const handleDrop = function (e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files)
    }
  }

  // triggers when file is selected with click
  const handleChange = function (e) {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files)
    }
  }

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.click()
  }
  const ipcRenderer = window.electron.ipcRenderer
  const [files, setFiles] = useState(null)
  const [imgPreview, setImgPreview] = useState('')
  const [form] = Form.useForm()
  const [timePairs, setTimePairs] = useState([{ time: '00:00:00' }])
  const [time, setTime] = useState('')

  function handleFile(files) {
    setFiles(files[0])
    setImgPreview(URL.createObjectURL(files[0]))
  }
  const handleTimeUpdate = (event) => {
    const currentTime = event.target.currentTime
    setTime(currentTime)
  }

  const handleInputChange = (index, event) => {
    const values = [...timePairs]
    values[index][event.target.name] = event.target.value
    setTimePairs(values)
  }

  const handleAddPair = () => {
    if (timePairs.find((pair) => pair.time === secondsToHms(time))) {
      toast.error('Time already exists')
      return
    }
    setTimePairs([{ time: secondsToHms(time) }, ...timePairs])
  }

  const handleRemovePair = (index) => {
    const values = [...timePairs]
    values.splice(index, 1)
    setTimePairs(values)
  }

  const handleProcessVideo = async () => {
    try {
      if (key === '') return toast.error('key is required')

      const datas = [...timePairs].sort((a, b) => hmsToSeconds(a.time) - hmsToSeconds(b.time))
      const lastDatas = datas.map((data) => data.time)
      ipcRenderer.send('submit', {
        partions: lastDatas,
        path: files.path,
        key: key
      })
    } catch (error) {
      toast.error(`Error: ${error}`)
    }
  }

  useEffect(() => {
    ipcRenderer.on('task:added', (e, data) => {
      toast.success(`${data.message}`)
    })
  }, [])
  return (
    <div className="flex flex-col items-center h-screen">
      {!files && (
        <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
          <input
            ref={inputRef}
            type="file"
            id="input-file-upload"
            multiple={true}
            onChange={handleChange}
          />
          <label
            id="label-file-upload"
            htmlFor="input-file-upload"
            className={dragActive ? 'drag-active' : ''}
          >
            <div>
              <p>Drag and drop your file here or</p>
              <button className="upload-button" onClick={onButtonClick}>
                Upload a file
              </button>
            </div>
          </label>
          {dragActive && (
            <div
              id="drag-file-element"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            ></div>
          )}
        </form>
      )}
      <div className="mt-4 relative">
        {files && (
          <>
            <div
              className="absolute z-50"
              style={{ top: -50, right: -30, zIndex: 50 }}
              onClick={() => {
                setFiles(null)
                setTimePairs([{ time: '00:00:00' }])
              }}
            >
              <CloseIcon />
            </div>
            <div className="flex flex-col items-center w-full">
              <video
                src={imgPreview}
                controls
                style={{ borderRadius: '8px', height: 300 }}
                className="w-full object-cover mb-2 cursor-pointer"
                onTimeUpdate={handleTimeUpdate}
              />
              <div className="flex w-full">
                <PerfectScrollbar className="flex-grow overflow-y-auto max-h-60 w-full">
                  <Form
                    form={form}
                    translate="yes"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 24 }}
                    autoComplete="off"
                    size="middle"
                    validateTrigger={['onBlur', 'onChange']}
                    labelAlign="left"
                    colon={false}
                  >
                    {timePairs?.length === 0 && <div style={{ width: 287 }}></div>}
                    {timePairs.map((pair, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2 w-full">
                        <FormItem className="">
                          <div className="flex">
                            <Input
                              maxLength={8}
                              rules={[
                                {
                                  pattern: new RegExp(regex),
                                  message: 'Invalid time format'
                                }
                              ]}
                              name="time"
                              placeholder="Time (in seconds)"
                              value={pair.time}
                              onChange={(event) => handleInputChange(index, event)}
                            />

                            <Button
                              type="ghost"
                              icon={
                                <DeleteTwoTone
                                  twoToneColor={'#FF4D4F'}
                                  onClick={() => handleRemovePair(index)}
                                />
                              }
                            />
                          </div>
                        </FormItem>
                      </div>
                    ))}
                  </Form>
                </PerfectScrollbar>
                <div className="flex flex-col justify-start ml-4 gap-1" style={{ maxWidth: 200 }}>
                  <Button type="dashed" onClick={handleAddPair} block>
                    Add Time Pair
                  </Button>
                  <Input
                    name="key"
                    placeholder="key"
                    onChange={(event) => setKey(event.target.value)}
                  />
                  <Button type="primary" onClick={handleProcessVideo} block>
                    Add to Video
                  </Button>
                  <p>{files.name}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DragAndDrop
