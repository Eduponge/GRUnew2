const apiKey = "f7cc9bafb7216fcd501a59db4a9ca430";
const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=GRU&flight_status=active`;

// Mapeamento dos bins para classe, label e ordem
const delayBins = [
  {
    key: "bin-acima21",
    label: "Acima de 21 min",
    sort: 0,
    match: (delay) => delay != null && delay > 21
  },
  {
    key: "bin-20-10",
    label: "Entre 20 e 10 min",
    sort: 1,
    match: (delay) => delay != null && delay >= 10 && delay <= 21
  },
  {
    key: "bin-9-0",
    label: "Entre 9 e 0 min",
    sort: 2,
    match: (delay) => delay != null && delay >= 0 && delay <= 9
  },
  {
    key: "bin--1--10",
    label: "Entre -1 e -10 min",
    sort: 3,
    match: (delay) => delay != null && delay >= -10 && delay <= -1
  },
  {
    key: "bin--11--20",
    label: "Entre -11 e -20 min",
    sort: 4,
    match: (delay) => delay != null && delay >= -20 && delay <= -11
  },
  {
    key: "bin-menor20",
    label: "Menor de -20 min",
    sort: 5,
    match: (delay) => delay != null && delay < -20
  },
  {
    key: "bin-seminfo",
    label: "Sem info",
    sort: 6,
    match: (delay) => delay == null
  },
];

// Função para determinar bin
function getDelayBin(delay) {
  return delayBins.find(bin => bin.match(delay)) || delayBins[delayBins.length - 1];
}

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    let flights = data.data || [];
    flights = flights.filter(flight => !flight.codeshared);

    // Calcula delay e bin para cada voo
    flights = flights.map(flight => {
      const scheduledArrival = flight.arrival?.scheduled;
      const estimatedArrival = flight.arrival?.estimated;
      let delayMinutes = null;
      if (scheduledArrival && estimatedArrival) {
        const scheduledDate = new Date(scheduledArrival);
        const estimatedDate = new Date(estimatedArrival);
        delayMinutes = Math.round((estimatedDate - scheduledDate) / 60000);
      }
      const bin = getDelayBin(delayMinutes);
      return { ...flight, delayMinutes, delayBin: bin.key, delayLabel: bin.label, delaySort: bin.sort };
    });

    // Agrupa voos por bin
    const grouped = {};
    delayBins.forEach(bin => grouped[bin.key] = []);
    flights.forEach(flight => {
      grouped[flight.delayBin].push(flight);
    });

    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = "";

    // Para cada bin, se houver voos, mostra header e voos
    delayBins.forEach(bin => {
      const flightsBin = grouped[bin.key];
      if (flightsBin.length > 0) {
        // Header da categoria
        const headerRow = document.createElement("tr");
        headerRow.className = "category-row";
        const headerCell = document.createElement("td");
        headerCell.colSpan = 7;
        headerCell.textContent = bin.label;
        headerRow.appendChild(headerCell);
        tbody.appendChild(headerRow);

        flightsBin.forEach(flight => {
          const airline = flight.airline?.name || "";
          const flightNumber = flight.flight?.number || "";
          const origin = flight.departure?.iata || "";
          const scheduledArrival = flight.arrival?.scheduled ? new Date(flight.arrival.scheduled).toLocaleString("pt-BR") : "";
          const estimatedArrival = flight.arrival?.estimated ? new Date(flight.arrival.estimated).toLocaleString("pt-BR") : "";
          const delay = flight.delayMinutes != null ? flight.delayMinutes : "";
          const delayLabel = flight.delayLabel;
          const delayBinClass = flight.delayBin;

          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="delay-category ${delayBinClass}">${delayLabel}</td>
            <td>${airline}</td>
            <td>${flightNumber}</td>
            <td>${origin}</td>
            <td>${scheduledArrival}</td>
            <td>${estimatedArrival}</td>
            <td>${delay}</td>
          `;
          tbody.appendChild(row);
        });
      }
    });
  })
  .catch(error => {
    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = `<tr><td colspan="7">Erro ao obter dados: ${error}</td></tr>`;
    console.error("Error fetching flight data:", error);
  });
