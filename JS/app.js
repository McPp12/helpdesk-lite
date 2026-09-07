// ==========================================================
// HelpDesk Lite - app.js
// ==========================================================

// ---------- Almacenamiento ----------
const STORAGE_KEY_TICKETS = 'helpdesk-lite-tickets'
const STORAGE_KEY_FOLIO = 'helpdesk-lite-folio-counter'

// ---------- Datos de ejemplo (solo se usan si no hay datos guardados) ----------
const seedTickets = [
    {
        id: 4, 
        folio: 'HD-0004',
        title: 'Computadora no inicia',
        description: 'El equipo no enciende al presionar el botón de encendido.',
        category: 'Hardware',
        priority: 'Alta',
        status: 'Nuevo',
        createdAt: '2026-09-02T09:10:00'
    },
    {
        id: 5,
        folio: 'HD-0005',
        title: 'Internet caído en laboratorio',
        description: 'No existe conexión en los equipos del laboratorio A.',
        category: 'Red',
        priority: 'Crítica',
        status: 'En proceso',
        createdAt: '2026-09-02T10:35:00'
    }
]

// ---------- Reglas de negocio: transiciones de estado (RN-04 a RN-07) ----------
const STATUS_TRANSITIONS = {
    'Nuevo': ['En proceso', 'Cancelado'],
    'En proceso': ['Resuelto', 'Cancelado'],
    'Resuelto': ['Cerrado'],
    'Cerrado': [],
    'Cancelado': []
}

// ---------- Acciones disponibles según el estado actual ----------
const STATUS_ACTIONS = {
    'Nuevo': [
        { label: 'Iniciar atención', nextStatus: 'En proceso', type: 'primary' },
        { label: 'Cancelar', nextStatus: 'Cancelado', type: 'secondary' }
    ],
    'En proceso': [
        { label: 'Resolver', nextStatus: 'Resuelto', type: 'primary' },
        { label: 'Cancelar', nextStatus: 'Cancelado', type: 'secondary' }
    ],
    'Resuelto': [
        { label: 'Cerrar', nextStatus: 'Cerrado', type: 'primary' }
    ],
    'Cerrado': [],
    'Cancelado': []
}

// ---------- Estado de la aplicación ----------
let tickets = JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS)) || seedTickets
let nextFolioNumber = Number(localStorage.getItem(STORAGE_KEY_FOLIO)) || 6

let currentFilters = {
    status: 'Todos',
    priority: 'Todas',
    search: ''
}

// ---------- Referencias al DOM ----------
const ticketForm = document.querySelector('#ticket-form')
const titleInput = document.querySelector('#ticket-title')
const descriptionInput = document.querySelector('#ticket-description')
const categorySelect = document.querySelector('#ticket-category')
const prioritySelect = document.querySelector('#ticket-priority')
const formError = document.querySelector('#form-error')

const ticketsContainer = document.querySelector('#tickets-container')
const searchInput = document.querySelector('#search-input')
const statusFilterButtons = document.querySelectorAll('.filter-button')
const priorityFilterSelect = document.querySelector('#priority-select')

const totalCountEl = document.querySelector('#total-count')
const nuevosCountEl = document.querySelector('#nuevos-count')
const procesoCountEl = document.querySelector('#proceso-count')
const resueltosCountEl = document.querySelector('#resueltos-count')

// ---------- Utilidades ----------
const formatDate = (isoString) => {
    const date = new Date(isoString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

const generateFolio = () => {
    const number = nextFolioNumber
    const folio = `HD-${String(number).padStart(4, '0')}`
    nextFolioNumber = number + 1
    localStorage.setItem(STORAGE_KEY_FOLIO, String(nextFolioNumber))
    return { id: number, folio }
}

const isValidTransition = (currentStatus, nextStatus) => {
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || []
    return allowedTransitions.includes(nextStatus)
}

const saveTickets = () => {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets))
}

// ---------- Renderizado de tickets ----------
const createActionButtonsMarkup = (ticket) => {
    const actions = STATUS_ACTIONS[ticket.status] || []
    if (actions.length === 0) {
        return ''
    }
    return actions.map((action) => `
        <button
            class="button button-${action.type} ticket-action-button"
            data-ticket-id="${ticket.id}"
            data-next-status="${action.nextStatus}"
        >
            ${action.label}
        </button>
    `).join('')
}

const createTicketCardMarkup = (ticket) => `
    <span class="badge" data-priority="${ticket.priority}">${ticket.priority}</span>
    <span class="ticket-folio">${ticket.folio}</span>
    <h3>${ticket.title}</h3>
    <p class="ticket-description">${ticket.description}</p>
    <div class="ticket-information">
        <p><strong>Categoría:</strong> ${ticket.category}</p>
        <p><strong>Creado:</strong> ${formatDate(ticket.createdAt)}</p>
        <p>
            <strong>Estado:</strong>
            <span class="badge" data-status="${ticket.status}">${ticket.status}</span>
        </p>
    </div>
    <div class="ticket-actions">
        ${createActionButtonsMarkup(ticket)}
    </div>
`

const renderTickets = (ticketsToRender) => {
    ticketsContainer.innerHTML = ''

    if (ticketsToRender.length === 0) {
        ticketsContainer.innerHTML = `
            <p class="empty-message">No hay tickets que coincidan con la búsqueda o los filtros.</p>
        `
        return
    }

    ticketsToRender.forEach((ticket) => {
        const article = document.createElement('article')
        article.classList.add('ticket-card')
        article.dataset.priority = ticket.priority
        article.innerHTML = createTicketCardMarkup(ticket)
        ticketsContainer.appendChild(article)
    })
}

// ---------- Dashboard dinámico (RN-08) ----------
const renderDashboard = () => {
    totalCountEl.textContent = tickets.length
    nuevosCountEl.textContent = tickets.filter((ticket) => ticket.status === 'Nuevo').length
    procesoCountEl.textContent = tickets.filter((ticket) => ticket.status === 'En proceso').length
    resueltosCountEl.textContent = tickets.filter((ticket) => ticket.status === 'Resuelto').length
}

// ---------- Filtros y búsqueda (RN-09, RN-10) ----------
const applyFiltersAndRender = () => {
    let filteredTickets = tickets

    if (currentFilters.status !== 'Todos') {
        filteredTickets = filteredTickets.filter((ticket) => ticket.status === currentFilters.status)
    }

    if (currentFilters.priority !== 'Todas') {
        filteredTickets = filteredTickets.filter((ticket) => ticket.priority === currentFilters.priority)
    }

    const searchTerm = currentFilters.search.trim().toLowerCase()
    if (searchTerm !== '') {
        filteredTickets = filteredTickets.filter((ticket) =>
            ticket.folio.toLowerCase().includes(searchTerm) ||
            ticket.title.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm)
        )
    }

    renderTickets(filteredTickets)
}

searchInput.addEventListener('input', (event) => {
    currentFilters.search = event.target.value
    applyFiltersAndRender()
})

statusFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        statusFilterButtons.forEach((currentButton) => currentButton.classList.remove('active'))
        button.classList.add('active')
        currentFilters.status = button.dataset.status
        applyFiltersAndRender()
    })
})

priorityFilterSelect.addEventListener('change', (event) => {
    currentFilters.priority = event.target.value
    applyFiltersAndRender()
})

// ---------- Transiciones de estado (RF-11, RF-12) ----------
const updateTicketStatus = (ticketId, nextStatus) => {
    const ticket = tickets.find((currentTicket) => currentTicket.id === ticketId)
    if (!ticket) {
        return
    }

    if (!isValidTransition(ticket.status, nextStatus)) {
        console.warn(`Transición inválida: ${ticket.status} -> ${nextStatus}`)
        return
    }

    ticket.status = nextStatus
    saveTickets()
    applyFiltersAndRender()
    renderDashboard()
}

ticketsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('.ticket-action-button')
    if (!button) {
        return
    }
    const ticketId = Number(button.dataset.ticketId)
    const nextStatus = button.dataset.nextStatus
    updateTicketStatus(ticketId, nextStatus)
})

// ---------- Creación de tickets (RF-01 a RF-06, RN-01 a RN-03) ----------
const showFormError = (message) => {
    formError.textContent = message
}

const clearFormError = () => {
    formError.textContent = ''
}

ticketForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const title = titleInput.value.trim()
    const description = descriptionInput.value.trim()
    const category = categorySelect.value
    const priority = prioritySelect.value

    if (!title || !description || !category || !priority) {
        showFormError('Completa título, descripción, categoría y prioridad antes de crear el ticket.')
        return
    }

    clearFormError()

    const { id, folio } = generateFolio()

    const newTicket = {
        id,
        folio,
        title,
        description,
        category,
        priority,
        status: 'Nuevo',
        createdAt: new Date().toISOString()
    }

    tickets.push(newTicket)
    saveTickets()
    ticketForm.reset()
    applyFiltersAndRender()
    renderDashboard()
})

// ---------- Inicialización ----------
applyFiltersAndRender()
renderDashboard()
