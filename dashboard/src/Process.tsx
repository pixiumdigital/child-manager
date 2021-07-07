import React, { useEffect, useState } from 'react';
import axios from 'axios'

export const ProcessComponent = (process: any) => {
    const [logs, setLogs] = useState([])
    const [logsError, setLogsError] = useState([])

    const getData = (id: string) => {
        axios.get("http://localhost:7000/logs/" + id).then((res) => {
            if (res.data.logs) {
                console.log(res.data)
                setLogs(res.data.logs)
            }
            if (res.data.logsError) {
                setLogsError(res.data.logsError)
            }
        }).catch(e => {

        })
    }

    useEffect(() => {
        setInterval(() => {
            getData(process.process.processId)
        }, 5000)
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
        </div>
    )

}