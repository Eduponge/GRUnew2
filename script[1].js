const apiUrl = "https://v0-new-project-wndpayl978c.vercel.app/api/flights";

// Função para formatar datas (adiciona +3h ao UTC)
function formatTime(str) {
    if (!str) return "";
    try {
        const date = new Date(str);
        date.setHours(date.getHours() + 3);
        return date.toISOString().replace("T", " ").substring(0, 16);
    } catch {
        return str;
    }
}

function renderFlights(flights) {
    const tbody = document.querySelector("#flightTable tbody");
    tbody.innerHTML = "";
    if (!flights.length) {
        document.getElementById("msg").textContent = "Nenhum voo encontrado.";
        return;
    }
    document.getElementById("msg").textContent = "";
    flights.forEach(flight => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${flight.operator_icao || ""}</td>
            <td>${flight.ident_iata || ""}</td>
            <td>${flight.registration || ""}</td>
            <td>${flight.origin?.ident_iata || ""}</td>
            <td>${formatTime(flight.scheduled_in)}</td>
            <td>${formatTime(flight.estimated_in)}</td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetch(apiUrl)
        .then(resp => resp.json())
        .then(apiData => {
            // Suporte ao formato {data: {arrivals: [...]}}
            const flights = (apiData.data && Array.isArray(apiData.data.arrivals))
                ? apiData.data.arrivals
                : (Array.isArray(apiData.flights) ? apiData.flights : []);
            renderFlights(flights);
        })
        .catch(err => {
            document.getElementById("msg").textContent = "Erro ao obter dados de voos.";
            console.error(err);
        });
});