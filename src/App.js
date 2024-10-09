import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [logs, setLogs] = useState([]);
  const [commands, setCommands] = useState([]);
  const maxDisplayedLogs = 17; // Adjust this number as needed

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3002`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "log") {
        if (data.message.includes("Bot server:")) {
          const trimmedMessage = data.message.split("@")[1] || data.message;
          const [username, command] = trimmedMessage
            .split(":")
            .map((s) => s.trim());
          setLogs((prevLogs) => [
            ...prevLogs.slice(-maxDisplayedLogs + 1),
            { username, command, id: Date.now() },
          ]);
        }
      } else if (data.type === "command") {
        setCommands((prevCommands) => [
          ...prevCommands,
          `${data.username}: ${data.message}`,
        ]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col h-screen justify-end overflow-hidden">
        <AnimatePresence initial={false}>
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              layout
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-emerald-950 text-white p-4 rounded-md flex justify-between mb-2 w-96 ml-5 shadow-lg border-2 border-emerald-900"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-green-600 capitalize font-black">
                  {log.username}
                </span>
                {["a", "b"].includes(log.command.toLowerCase().split(/x\s*|\s+x\s*/i)[0]) ? (
                  <span className="text-emerald-900 font-bold bg-emerald-700 border-2 border-emerald-800 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                    {log.command.toUpperCase()}
                  </span>
                ) : ["l", "r"].includes(log.command.toLowerCase().split(/x\s*|\s+x\s*/i)[0]) ? (
                  <span className="text-emerald-900 font-bold bg-emerald-700 border-2 border-emerald-800 rounded-md p-2 w-8 h-8 flex items-center justify-center">
                    {log.command.toUpperCase()}
                  </span>
                ) : ["start", "select"].includes(log.command.toLowerCase().split(/x\s*|\s+x\s*/i)[0]) ? (
                  <span className="text-emerald-900 font-black bg-emerald-700 border-2 border-emerald-800 rounded-full p-2 px-4 flex items-center justify-center text-xs">
                    {log.command.toUpperCase()}
                  </span>
                ) : ["up", "down", "left", "right"].includes(log.command.toLowerCase().split(/x\s*|\s+x\s*/i)[0]) ? (
                  <span className="text-emerald-900 font-bold bg-emerald-700 border-2 border-emerald-800 rounded-md p-2 w-8 h-8 flex items-center justify-center">
                    {log.command.toLowerCase().startsWith("up") ? <FontAwesomeIcon icon={faArrowUp} /> : 
                     log.command.toLowerCase().startsWith("down") ? <FontAwesomeIcon icon={faArrowDown} /> : 
                     log.command.toLowerCase().startsWith("left") ? <FontAwesomeIcon icon={faArrowLeft} /> : 
                     <FontAwesomeIcon icon={faArrowRight} />}
                    {log.command.match(/x\s*\d+/i) && <sup className="ml-1">{log.command.match(/x\s*(\d+)/i)[1]}</sup>}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">{log.command}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;