import { useEffect, useState } from "react";

export default function useWebSocket() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // TODO: handle for the case when socket connection is lost, then we need to reconnect 
    const ws = new WebSocket(import.meta.env.VITE_SOCKET_URL);

    ws.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    return () => ws.close();
  }, []);

  return data;
}
