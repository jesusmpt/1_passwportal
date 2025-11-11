import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/methods')
      .then(res => res.json())
      .then(json => setData(json))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (!data) return <p>Error al obtener información</p>;

  const { user, availableMethods, missingPasswordless } = data;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Portal Passwordless</h1>
      <h2>Información del usuario:</h2>
      <ul>
        <li>Nombre: {user.givenName} {user.surname}</li>
        <li>Correo: {user.mail || user.userPrincipalName}</li>
      </ul>

      <h2>Métodos de autenticación configurados:</h2>
      <ul>
        {availableMethods.map((m,i)=>(
          <li key={i}>{m.displayName || m.type} {m.phoneNumber ? '- '+m.phoneNumber : ''}</li>
        ))}
      </ul>

      {missingPasswordless.length>0 ? (
        <>
          <h2>Para habilitar passwordless necesitas:</h2>
          <ul>
            {missingPasswordless.map((m,i)=><li key={i}>{m}</li>)}
          </ul>
        </>
      ) : (<p>¡Ya tienes passwordless configurado!</p>)}

      <button onClick={fetchData} style={{ marginTop: '20px' }}>Volver a comprobar</button>
      <button onClick={() => window.location.href='/logout'} style={{ marginLeft: '10px' }}>Logout</button>
    </div>
  );
}

export default App;
