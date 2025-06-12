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

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  // Formato: dd/MM/yyyy HH:mm
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    let flights = data.data || [];
    // FILTRA SOMENTE VOOS ONDE codeshared NÃO EXISTE, É undefined ou null
    flights = flights.filter(flight => flight.codeshared == null);

    flights = flights.map(flight => {
      const scheduledArrival = flight.arrival?.scheduled;
      const estimatedArrival = flight.arrival?.estimated;
      let delayMinutes = null;
      if (scheduledArrival && estimatedArrival) {
        const scheduledDate = new Date(scheduledArrival);
        const estimatedDate = new Date(estimatedArrival);
        delayMinutes = Math.round((estimatedDate - scheduledDate) / 60000);
      }
      const estimatedDisplay = estimatedArrival ? formatDate(estimatedArrival) : "Sem informação";
      const scheduledDisplay = scheduledArrival ? formatDate(scheduledArrival) : "";
      return { 
        ...flight, 
        delayMinutes, 
        delayCategory: getDelayCategoryCustom(delayMinutes),
        estimatedDisplay,
        scheduledDisplay
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
      const delayCategory = flight.delayCategory;
      const airline = flight.airline?.name || "";
      const flightNumber = flight.flight?.number || "";
      const origin = flight.departure?.iata || "";
      const scheduledArrival = flight.scheduledDisplay;
      const estimatedArrival = flight.estimatedDisplay;
      const delay = flight.delayMinutes != null ? flight.delayMinutes : "";

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
