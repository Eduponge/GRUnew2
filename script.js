const apiKey = "f7cc9bafb7216fcd501a59db4a9ca430";
const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=GRU&flight_status=active`;

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    let flights = data.data || [];

    // Exibe apenas voos que NÃO têm o campo 'codeshared' (ou seja, codeshared null ou undefined)
    flights = flights.filter(flight => !flight.flight?.codeshared);

    // Calcula o delay (em minutos) como a diferença entre estimatedArrival e scheduledArrival
    flights = flights.map(flight => {
      const scheduledArrival = flight.arrival?.scheduled;
      const estimatedArrival = flight.arrival?.estimated;
      let delayMinutes = null;
      let estimatedDisplay = estimatedArrival;

      if (scheduledArrival && estimatedArrival) {
        const scheduledDate = new Date(scheduledArrival);
        const estimatedDate = new Date(estimatedArrival);
        delayMinutes = Math.round((estimatedDate - scheduledDate) / 60000);
      }

      if (!estimatedArrival) {
        estimatedDisplay = "Sem informação";
      }

      return { 
        ...flight, 
        delayMinutes,
        estimatedDisplay
      };
    });

    // Ordena por delay decrescente (prioriza voos mais atrasados no topo)
    flights.sort((a, b) => (b.delayMinutes ?? -Infinity) - (a.delayMinutes ?? -Infinity));

    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = "";

    flights.forEach(flight => {
      const airline = flight.airline?.name || "";
      const flightNumber = flight.flight?.number || "";
      const origin = flight.departure?.iata || "";
      const scheduledArrival = flight.arrival?.scheduled || "";
      const estimatedArrival = flight.estimatedDisplay !== undefined ? flight.estimatedDisplay : (flight.arrival?.estimated || "");
      const delay = flight.delayMinutes != null ? flight.delayMinutes : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td></td>
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
    tbody.innerHTML = `<tr><td colspan="7">Erro ao obter dados: ${error}</td></tr>`;
    console.error("Error fetching flight data:", error);
  });
