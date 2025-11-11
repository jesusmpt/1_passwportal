import React, { useEffect, useState } from 'react';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/methods");
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch(e){ json = null; }

      if(res.status === 401){
        window.location.href = "/login";
        return;
      }

      if(!res.ok){
        throw new Error(json?.error || text || "Error desconocido");
      }

      setData(json);
    } catch(err){
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  if(loading) return <p>Cargando...</p>;
  if(error) return <p>Error al obtener información: {error}</p>;

  return (
    <div style={{padding: '2rem'}}>
      <h1>Portal Passwordless</h1>
      <p><strong>Usuario:</strong> {data.user.displayName} ({data.user.mail || data.user.userPrincipalName})</p>
      <h2>Métodos de autenticación:</h2>
      <ul>
        {data.availableMethods.map(m => (
          <li key={m.type}>
            {m.type} {m.phoneNumber ? `(${m.phoneNumber})` : ''} {m.displayName && `- ${m.displayName}`}
          </li>
        ))}
      </ul>
      {data.missingPasswordless.length > 0 ? (
        <>
          <h3>Faltan para habilitar passwordless:</h3>
          <ul>
            {data.missingPasswordless.map(m => <li key={m}>{m}</li>)}
          </ul>
          <button onClick={fetchData}>Volver a comprobar</button>
        </>
      ) : <p>¡Passwordless ya habilitado!</p>}
      <button onClick={()=>window.location.href="/logout"}>Cerrar sesión</button>
    </div>
  );
}
