const apiUrl = "https://v0-new-project-wndpayl978c.vercel.app/api/flights";

// Exibe todos os voos recebidos em data.arrivals, sem filtros nem agrupamentos

document.addEventListener("DOMContentLoaded", () => {
  fetch(apiUrl)
    .then(response => response.json())
    .then(apiData => {
      // Pega todos os voos recebidos da API, sem filtros
      const flights = (apiData.data && Array.isArray(apiData.data.arrivals)) ? apiData.data.arrivals : [];

      const tbody = document.querySelector("#flightTable tbody");
      tbody.innerHTML = "";

      flights.forEach(flight => {
        const airline = flight.operator_icao || "";
        const flightNumber = flight.ident_iata || "";
        const registration = flight.registration || "";
        const origin = (flight.origin && flight.origin.code_iata) ? flight.origin.code_iata : "";
        const scheduledArrival = flight.scheduled_in || flight.scheduled_on || "";
        const estimatedArrival = flight.estimated_in || flight.estimated_on || "";

        const formattedSTA = formatTime(scheduledArrival);
        const formattedETA = formatTime(estimatedArrival);

        // Não calcula nem exibe delay nem categoria
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${airline}</td>
          <td>${flightNumber}</td>
          <td>${registration}</td>
          <td>${origin}</td>
          <td>${formattedSTA}</td>
          <td>${formattedETA}</td>
        `;
        tbody.appendChild(row);
      });

      if (flights.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">Nenhum voo encontrado.</td></tr>`;
      }
    })
    .catch(error => {
      const tbody = document.querySelector("#flightTable tbody");
      tbody.innerHTML = `<tr><td colspan="6">Erro ao obter dados: ${error}</td></tr>`;
      console.error("Error fetching flight data:", error);
    });
});
