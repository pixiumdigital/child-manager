import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import { ProcessComponent } from './Process';
function App() {
    const [status, setStatus] = useState(false);
    const [processes, setProcesses] = useState([])

    const getStatus = () => {
        axios.get("http://localhost:7000/status").then((res) => {
            if (res.data.status) {
                setStatus(res.data.status)

            }
        })
    }

    const getProcesses = () => {
        axios.get("http://localhost:7000/processes").then((res) => {
            if (res.data.processes) {
                console.log(res.data.processes)
                setProcesses(res.data.processes)
            }
        }).catch(e => {
            setProcesses([])
        })
    }
    useEffect(() => {
        getStatus()
        getProcesses()
        setInterval(() => {
            getStatus()
        }, 5000)
        setInterval(() => {
            getProcesses()
        }, 5000)
    }, [])

    return (
        <div className="App">
            <header className="App-header">
                <h1>Child Manager</h1>
                <p>
                    STATUS: {(status) ? <span className="online">ONLINE</span> : <span className="offline">OFFLINE</span>}
                </p>
            </header>
            <div className="App-body">{processes.map((process, index) => {
                return <ProcessComponent key={index} process={process} />
            })}</div>
        </div>
    );
}

export default App;
