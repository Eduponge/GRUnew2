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
      return { ...flight, delayMinutes, delayCategory: getDelayCategoryCustom(delayMinutes) };
    });

    // Ordena por categoria do delay conforme a ordem dos bins
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
      // Dentro do bin, ordena por delay decrescente
      return (b.delayMinutes ?? 0) - (a.delayMinutes ?? 0);
    });

    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = "";

    let lastCategory = null;
    flights.forEach(flight => {
      const {
        airline, flight: flightData, departure, arrival, delayMinutes, delayCategory
      } = flight;
      const flightNumber = flightData?.number || "";
      const origin = departure?.iata || "";
      const scheduledArrival = arrival?.scheduled || "";
      const estimatedArrival = arrival?.estimated || "";
      const delay = delayMinutes != null ? delayMinutes : "";

      // Define a classe de bin para cor
      const binClass =
        delayCategory === "Acima de 21" ? "bin-acima21" :
        delayCategory === "Entre 20 e 10" ? "bin-20-10" :
        delayCategory === "Entre 9 e 0" ? "bin-9-0" :
        delayCategory === "Entre -1 e -10" ? "bin--1--10" :
        delayCategory === "Entre -11 e -20" ? "bin--11--20" :
        delayCategory === "Menor de -20" ? "bin-menor20" :
        "bin-seminfo";

      // Adicione o cabeçalho de grupo se a categoria mudou
      if (delayCategory !== lastCategory) {
        const headerRow = document.createElement("tr");
        headerRow.className = "delay-header";
        const headerCell = document.createElement("td");
        headerCell.colSpan = 7;
        headerCell.innerHTML = `<strong>${delayCategory}</strong>`;
        headerCell.style.background = "#e0e0e0";
        headerCell.style.textAlign = "center";
        headerCell.style.fontSize = "1.1em";
        headerRow.appendChild(headerCell);
        tbody.appendChild(headerRow);
        lastCategory = delayCategory;
      }

      const row = document.createElement("tr");
      row.className = binClass;

      row.innerHTML = `
        <td class="delay-category">${delayCategory}</td>
        <td>${airline?.name || ""}</td>
        <td>${flightNumber}</td>
        <td>${origin}</td>
        <td>${scheduledArrival}</td>
        <td>${estimatedArrival}</td>
        <td class="${binClass}">${delay}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(error => {
    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = `<tr><td colspan="7">Erro ao obter dados: ${error}</td></tr>`;
    console.error("Error fetching flight data:", error);
  });
