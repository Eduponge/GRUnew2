const apiKey = "f7cc9bafb7216fcd501a59db4a9ca430";
const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=GRU&flight_status=active`;

function getDelayCategoryCustom(delay) {
  if (delay == null) return "Sem info";
  if (delay > 21) return "Acima de 21";
  if (delay >= 10 && delay <= 20) return "Entre 20 e 10";
  if (delay >= 0 && delay <= 9) return "Entre 9 e 0";
  if (delay >= -10 && delay <= -1) return "Entre -1 e -10";
  if (delay >= -20 && delay <= -11) return "Entre -11 e -20";
  if (delay < -20) return "Menor de -20";
  return "Sem info";
}

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    let flights = data.data || [];

    // FILTRA VOOS QUE NÃO SÃO CODESHARE
    flights = flights.filter(flight => !flight.codeshared);

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
        delayCategory: getDelayCategoryCustom(delayMinutes),
        estimatedDisplay
      };
    });

    const categoryOrder = [
      "Acima de 21",
      "Entre 20 e 10",
      "Entre 9 e 0",
      "Entre -1 e -10",
      "Entre -11 e -20",
      "Menor de -20",
      "Sem info"
    ];
    flights.sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.delayCategory);
      const idxB = categoryOrder.indexOf(b.delayCategory);
      if (idxA !== idxB) return idxA - idxB;
      return (b.delayMinutes ?? 0) - (a.delayMinutes ?? 0);
    });

    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = "";

    flights.forEach(flight => {
      const airline = flight.airline?.name || "";
      const flightNumber = flight.flight?.number || "";
      const origin = flight.departure?.iata || "";
      const scheduledArrival = flight.arrival?.scheduled || "";
      const estimatedArrival = flight.estimatedDisplay !== undefined ? flight.estimatedDisplay : (flight.arrival?.estimated || "");
      const delay = flight.delayMinutes != null ? flight.delayMinutes : "";
      const delayCategory = flight.delayCategory;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${delayCategory}</td>
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
