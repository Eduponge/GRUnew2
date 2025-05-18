const apiKey = "72b8b16322c652134824b49732f3be24";
const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_status=active&arr_iata=GRU`;

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    const flights = data.data || [];
    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = "";

    flights.forEach(flight => {
      const airline = flight.airline?.name || "";
      const flightNumber = flight.flight?.number || "";
      const origin = flight.departure?.iata || "";
      const scheduledArrival = flight.arrival?.scheduled || "";
      const estimatedArrival = flight.arrival?.estimated || "";
      const delay = flight.arrival?.delay || 0;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${airline}</td>
        <td>${flightNumber}</td>
        <td>${origin}</td>
        <td>${scheduledArrival}</td>
        <td>${estimatedArrival}</td>
        <td>${delay}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(error => {
    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = `<tr><td colspan="6">Erro ao obter dados: ${error}</td></tr>`;
    console.error("Error fetching flight data:", error);
  });