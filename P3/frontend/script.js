const API = 'http://localhost:3000';

const mapDiv = document.getElementById('table-map');
const listUl = document.getElementById('reservation-list');
const modal = document.getElementById('modal');
const resForm = document.getElementById('reservation-form');
const tableForm = document.getElementById('table-form'); // Novo Form
const infoDisplay = document.getElementById('info-display');

let currentReservationId = null;

// Botão Adicionar Mesa
document.getElementById('btn-add-table').onclick = () => {
    document.getElementById('modal-title').innerText = "Nova Mesa";
    modal.style.display = 'flex';
    
    // Esconde os outros, mostra form de mesa
    infoDisplay.style.display = 'none';
    resForm.style.display = 'none';
    tableForm.style.display = 'block';
    
    // Reseta form
    tableForm.reset();
};

// Submissão da Nova Mesa
tableForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        number: parseInt(document.getElementById('new-table-number').value),
        capacity: parseInt(document.getElementById('new-table-capacity').value),
        location: document.getElementById('new-table-location').value
    };

    try {
        const res = await fetch(`${API}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        if (res.ok) {
            alert('Mesa Adicionada!');
            modal.style.display = 'none';
            loadData(); // Recarrega o mapa
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Erro ao conectar.');
    }
};

// --- RESTO DO CÓDIGO (Igual ao anterior) ---

async function loadData() {
    try {
        const [tablesRes, resRes] = await Promise.all([
            fetch(`${API}/tables`),
            fetch(`${API}/reservations`)
        ]);
        const tables = await tablesRes.json();
        const reservations = await resRes.json();
        
        renderMap(tables, reservations);
        renderList(reservations);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function renderMap(tables, reservations) {
    mapDiv.innerHTML = '';
    tables.forEach(table => {
        const activeRes = reservations.find(r => 
            r.tableNumber === table.number && 
            ['reservado', 'ocupado'].includes(r.status)
        );

        const card = document.createElement('div');
        let statusClass = 'green';
        if (activeRes) statusClass = activeRes.status === 'ocupado' ? 'red' : 'yellow';

        card.className = `card ${statusClass}`;
        card.innerHTML = `
            <h3>Mesa ${table.number}</h3>
            <p>${table.location}</p>
            <small>Cap: ${table.capacity}</small>
        `;
        
        card.onclick = () => openModal(table, activeRes);
        mapDiv.appendChild(card);
    });
}

function renderList(reservations) {
    listUl.innerHTML = '';
    const activeReservations = reservations.filter(r => r.status !== 'cancelado');

    if (activeReservations.length === 0) {
        listUl.innerHTML = '<p>Nenhuma reserva agendada.</p>';
        return;
    }

    activeReservations.forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${new Date(r.startTime).toLocaleString()}</strong> - Mesa ${r.tableNumber} - ${r.clientName}`;
        listUl.appendChild(li);
    });
}

function openModal(table, reservation) {
    document.getElementById('modal-title').innerText = `Mesa ${table.number}`;
    modal.style.display = 'flex';
    currentReservationId = null;

    // Esconde o form de criar mesa, pois clicamos em uma mesa existente
    tableForm.style.display = 'none';

    if (reservation) {
        resForm.style.display = 'none';
        infoDisplay.style.display = 'block';
        
        document.getElementById('info-client').innerText = reservation.clientName;
        document.getElementById('info-time').innerText = new Date(reservation.startTime).toLocaleString();
        document.getElementById('info-pax').innerText = reservation.pax + " pessoas";
        
        document.getElementById('btn-cancel').onclick = async () => {
            if(confirm('Tem certeza que deseja cancelar?')) {
                await fetch(`${API}/reservations/${reservation._id}`, { method: 'DELETE' });
                alert('Reserva cancelada.');
                modal.style.display = 'none';
                loadData();
            }
        };

        document.getElementById('btn-edit').onclick = () => {
            currentReservationId = reservation._id;
            infoDisplay.style.display = 'none';
            resForm.style.display = 'block';

            document.getElementById('input-table').value = table.number;
            document.getElementById('input-name').value = reservation.clientName;
            document.getElementById('input-contact').value = reservation.clientContact;
            document.getElementById('input-pax').value = reservation.pax;
            
            const dateObj = new Date(reservation.startTime);
            const localIso = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            document.getElementById('input-date').value = localIso;
            document.getElementById('input-pax').max = table.capacity;
        };

    } else {
        infoDisplay.style.display = 'none';
        resForm.style.display = 'block';
        resForm.reset();
        document.getElementById('input-table').value = table.number;
        document.getElementById('input-pax').max = table.capacity;
    }
}

// Submissão de RESERVA
resForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const data = {
        tableNumber: parseInt(document.getElementById('input-table').value),
        clientName: document.getElementById('input-name').value,
        clientContact: document.getElementById('input-contact').value,
        pax: parseInt(document.getElementById('input-pax').value),
        startTime: document.getElementById('input-date').value
    };

    let url = `${API}/reservations`;
    let method = 'POST';

    if (currentReservationId) {
        url = `${API}/reservations/${currentReservationId}`;
        method = 'PUT';
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        
        if (res.ok) {
            alert(currentReservationId ? 'Reserva Atualizada!' : 'Reserva Criada!');
            modal.style.display = 'none';
            loadData();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        alert('Erro de conexão com o servidor.');
    }
};

document.querySelector('.close-btn').onclick = () => modal.style.display = 'none';

loadData();