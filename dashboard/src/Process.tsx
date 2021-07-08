import React, { useEffect, useState } from 'react';
import axios from 'axios'

export const ProcessComponent = (process: any) => {
    const [logs, setLogs] = useState([])
    const [logsError, setLogsError] = useState([])

    const getData = (id: string) => {
        axios.get("http://localhost:7000/logs/" + id).then((res) => {
            if (res.data.logs) {
                setLogs(res.data.logs)
            }
            if (res.data.logsError) {
                setLogsError(res.data.logsError)
            }
        }).catch(e => {

        })
    }

    const restart = (id: string) => {
        axios.get("http://localhost:7000/restart/" + id).then((res) => {
            if (res.data.hasRestarted) {
                alert("Process was restarted with success")
            } else {
                alert("Process was restarted without success")
            }
        }).catch(e => {
            alert("Process was restarted without success")
        })
    }

    const kill = (id: string) => {
        axios.get("http://localhost:7000/kill/" + id).then((res) => {
            if (res.data.hasKilled) {
                alert("Process was killed with success")
            } else {
                alert("Process was killed without success")
            }
        }).catch(e => {
            alert("Process was killed without success")
        })
    }

    useEffect(() => {
        setInterval(() => {
            getData(process.process.processId)
        }, 2000)
    }, [])
    const processData = process?.process
    return (
        <div className="card">
            <h1>{processData.processName}</h1>
            <p>Started: {processData.processStart}</p>
            <div className="card-body">
                {logs.length > 0 &&
                    <div className="card-log">
                        {logs.map((e: string, index) => {
                            return <p key={`log-${index}`}>{e}</p>
                        })}
                    </div>
                }
                {logsError.length > 0 &&
                    <div className="card-log">
                        {logsError.map((e: string, index) => {
                            return <p key={`log-${index}`}>{e}</p>
                        })}
                    </div>
                }

            </div>
            <div className="card-footer">
                <div className="card-action">
                    <button className="btn btn-square btn-md btn-filled-green mr-10" onClick={() => { if (window.confirm('Are you sure you wish to restart the service?')) restart(process.process.processId) }}>
                        Restart
                    </button>
                    <button className="btn btn-square btn-md btn-filled-red" onClick={() => { if (window.confirm('Are you sure you wish to kill the service?')) kill(process.process.processId) }}>
                        Kill
                    </button>
                </div>

            </div>

        </div>
    )

}