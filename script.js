const apiUrl = "https://v0-new-project-wndpayl978c.vercel.app/api/flights";

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

// Função para converter e formatar a hora, adicionando 3 horas
function formatTime(str) {
  if (!str) return "";
  try {
    const date = new Date(str.replace("T", " ").replace("Z", ""));
    date.setHours(date.getHours() + 3);
    return date.toISOString().replace("T", " ").substring(0, 16);
  } catch {
    return str;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Títulos já estão ajustados no HTML
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      let flights = data.flights || [];
      flights = flights.filter(flight => flight.direction === "inbound");

      flights = flights.map(flight => {
        const airline = flight.operator_icao || "";
        const flightNumber = flight.ident_iata || "";
        const registration = flight.registration || "";
        const origin = flight.origin?.ident_iata || "";
        const scheduledArrival = flight.scheduled_in || "";
        const estimatedArrival = flight.estimated_in || "";

        const formattedSTA = formatTime(scheduledArrival);
        const formattedETA = formatTime(estimatedArrival);

        let delayMinutes = null;
        if (scheduledArrival && estimatedArrival) {
          try {
            const staDate = new Date(scheduledArrival);
            const etaDate = new Date(estimatedArrival);
            staDate.setHours(staDate.getHours() + 3);
            etaDate.setHours(etaDate.getHours() + 3);
            delayMinutes = Math.round((etaDate - staDate) / 60000);
          } catch {
            delayMinutes = null;
          }
        }

        return {
          airline,
          flightNumber,
          registration,
          origin,
          scheduledArrival: formattedSTA,
          estimatedArrival: formattedETA,
          delayMinutes,
          delayCategory: getDelayCategoryCustom(delayMinutes)
        };
      });

      const categoryOrder = [
        "Acima de 21", "Entre 20 e 10", "Entre 9 e 0", "Entre -1 e -10", "Entre -11 e -20", "Menor de -20", "Sem info"
      ];
      flights.sort((a, b) => {
        const idxA = categoryOrder.indexOf(a.delayCategory);
        const idxB = categoryOrder.indexOf(b.delayCategory);
        if (idxA !== idxB) return idxA - idxB;
        return (b.delayMinutes ?? 0) - (a.delayMinutes ?? 0);
      });

      const tbody = document.querySelector("#flightTable tbody");
      tbody.innerHTML = "";

      let lastCategory = null;
      flights.forEach(flight => {
        const {
          airline, flightNumber, registration, origin,
          scheduledArrival, estimatedArrival, delayMinutes, delayCategory
        } = flight;

        const binClass =
          delayCategory === "Acima de 21" ? "bin-acima21" :
          delayCategory === "Entre 20 e 10" ? "bin-20-10" :
          delayCategory === "Entre 9 e 0" ? "bin-9-0" :
          delayCategory === "Entre -1 e -10" ? "bin--1--10" :
          delayCategory === "Entre -11 e -20" ? "bin--11--20" :
          delayCategory === "Menor de -20" ? "bin-menor20" :
          "bin-seminfo";

        if (delayCategory !== lastCategory) {
          const headerRow = document.createElement("tr");
          headerRow.className = "delay-header";
          const headerCell = document.createElement("td");
          headerCell.colSpan = 8;
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
          <td>${airline}</td>
          <td>${flightNumber}</td>
          <td>${registration}</td>
          <td>${origin}</td>
          <td>${scheduledArrival}</td>
          <td>${estimatedArrival}</td>
          <td class="${binClass}">${delayMinutes != null ? delayMinutes : ""}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => {
      const tbody = document.querySelector("#flightTable tbody");
      tbody.innerHTML = `<tr><td colspan="8">Erro ao obter dados: ${error}</td></tr>`;
      console.error("Error fetching flight data:", error);
    });
});
