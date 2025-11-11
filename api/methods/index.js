const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = async function (context, req) {
  try {
    const userId = req.headers['x-ms-client-principal-id'];

    // Validar que el usuario esté autenticado
    if (!userId) {
      context.res = {
        status: 401,
        body: { error: "No autenticado. Por favor, inicia sesión." }
      };
      return;
    }

    const tenantId = '9ff87f7c-8358-46b5-88bc-d73c09ce789f';
    const clientId = '8dcec823-8928-41f7-a9b5-e85db1dc6c12';
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!clientSecret) {
      context.res = {
        status: 500,
        body: { error: "No se ha configurado el secreto del cliente en Azure Static Web Apps." }
      };
      return;
    }

    // Obtener token de Microsoft Graph
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          scope: 'https://graph.microsoft.com/.default',
          client_secret: clientSecret,
          grant_type: 'client_credentials'
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      context.res = {
        status: 500,
        body: { error: "No se pudo obtener token de Microsoft Graph", details: tokenData }
      };
      return;
    }

    const accessToken = tokenData.access_token;

    const client = Client.init({ authProvider: done => done(null, accessToken) });

    // Obtener datos del usuario
    const user = await client.api(`/users/${userId}`)
      .select('displayName,givenName,surname,mail,userPrincipalName')
      .get();

    if (!user) {
      context.res = {
        status: 404,
        body: { error: "Usuario no encontrado en Microsoft Graph" }
      };
      return;
    }

    // Obtener métodos de autenticación
    let methodsResponse;
    try {
      methodsResponse = await client.api(`/users/${userId}/authentication/methods`).get();
    } catch (e) {
      context.res = {
        status: 500,
        body: { error: "No se pudieron obtener los métodos de autenticación", details: e.message }
      };
      return;
    }

    const availableMethods = methodsResponse.value.map(m => ({
      type: m['@odata.type'].split('.').pop(),
      displayName: m.displayName || '',
      phoneNumber: m.phoneNumber || ''
    }));

    const passwordlessMethods = ['fido2AuthenticationMethod', 'microsoftAuthenticatorAuthenticationMethod'];
    const missing = passwordlessMethods.filter(
      m => !availableMethods.some(am => am.type.toLowerCase() === m.toLowerCase())
    );

    context.res = {
      status: 200,
      body: { user, availableMethods, missingPasswordless: missing }
    };

  } catch (error) {
    console.error(error);
    context.res = {
      status: 500,
      body: { error: "Error inesperado en el servidor", details: error.message }
    };
  }
};
