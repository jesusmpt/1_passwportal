import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/methods")
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = "/login";
        } else {
          const json = await res.json();
          setData(json);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error al obtener información: {error}</p>;
  if (!data) return <p>Cargando información...</p>;

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
      <ul>
        {data.missingPasswordless.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
      <button onClick={() => window.location.reload()}>
        Volver a comprobar
      </button>
    </div>
  );
}

export default App;
