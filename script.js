const apiKey = "f7cc9bafb7216fcd501a59db4a9ca430";
const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=GRU&flight_status=active`;

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    let flights = data.data || [];

    // FILTRA VOOS QUE NÃO SÃO CODESHARE
    flights = flights.filter(flight => !flight.codeshared);

    // Calcula o delay (em minutos) como a diferença entre estimatedArrival e scheduledArrival
    flights = flights.map(flight => {
      const scheduledArrival = flight.arrival?.scheduled;
      const estimatedArrival = flight.arrival?.estimated;
      let delayMinutes = null;
      if (scheduledArrival && estimatedArrival) {
        const scheduledDate = new Date(scheduledArrival);
        const estimatedDate = new Date(estimatedArrival);
        delayMinutes = Math.round((estimatedDate - scheduledDate) / 60000);
      }
      return { ...flight, delayMinutes };
    });

    // Ordena do maior delay para o menor
    flights.sort((a, b) => {
      if (b.delayMinutes == null && a.delayMinutes == null) return 0;
      if (b.delayMinutes == null) return -1;
      if (a.delayMinutes == null) return 1;
      return b.delayMinutes - a.delayMinutes;
    });

    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = "";

    flights.forEach(flight => {
      const airline = flight.airline?.name || "";
      const flightNumber = flight.flight?.number || "";
      const origin = flight.departure?.iata || "";
      const scheduledArrival = flight.arrival?.scheduled || "";
      const estimatedArrival = flight.arrival?.estimated || "";
      const delay = flight.delayMinutes != null ? flight.delayMinutes : "";

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
