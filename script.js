const apiUrl = "https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete";

function formatCell(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
}

document.addEventListener("DOMContentLoaded", () => {
    fetch(apiUrl)
        .then(resp => resp.json())
        .then(apiData => {
            // Detecta o array de voos (ajuste conforme a estrutura recebida)
            let flights = Array.isArray(apiData.arrivals)
                ? apiData.arrivals
                : (apiData.data?.arrivals || []);
            if (!flights.length) {
                document.getElementById("msg").textContent = "Nenhum voo encontrado.";
                return;
            }
            document.getElementById("msg").textContent = `Total de voos: ${flights.length}`;

            // Coleta todos os campos presentes no primeiro voo
            const allKeys = Array.from(
                flights.reduce((set, f) => {
                    Object.keys(f).forEach(k => set.add(k));
                    return set;
                }, new Set())
            );

            // Preenche o cabeçalho da tabela
            const headerRow = document.getElementById("flightTableHeader");
            headerRow.innerHTML = "";
            allKeys.forEach(key => {
                const th = document.createElement("th");
                th.textContent = key;
                headerRow.appendChild(th);
            });

            // Preenche as linhas
            const tbody = document.querySelector("#flightTable tbody");
            tbody.innerHTML = "";
            flights.forEach(flight => {
                const row = document.createElement("tr");
                row.innerHTML = allKeys.map(key => `<td>${formatCell(flight[key])}</td>`).join("");
                tbody.appendChild(row);
            });
        })
        .catch(err => {
            document.getElementById("msg").textContent = "Erro ao obter dados de voos.";
            console.error(err);
        });
});
