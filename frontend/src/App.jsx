import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/methods")
      .then(async (res) => {
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
        if (res.status === 401) {
          window.location.href = "/login";
        } else if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error desconocido");
        } else {
          return res.json();
        }
      })
      .then(json => setData(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando información...</p>;
  if (error) return <p>Error al obtener información: {error}</p>;

  return (
    <div>
      <h1>Bienvenido, {data.user.displayName}</h1>
      <p>Email: {data.user.mail}</p>

      <h2>Métodos de autenticación:</h2>
      <ul>
        {data.availableMethods.map((m, i) => (
          <li key={i}>
            {m.type} {m.phoneNumber ? `- ${m.phoneNumber}` : ""}
          </li>
        ))}
      </ul>

      <h3>Faltan para passwordless:</h3>
      {data.missingPasswordless.length === 0 ? (
        <p>Ya tienes todos los métodos passwordless configurados.</p>
      ) : (
        <ul>
          {data.missingPasswordless.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}

      <button onClick={() => window.location.reload()}>
        Volver a comprobar
      </button>
    </div>
  );
}

export default App;
