// ─── Constantes ──────────────────────────────────
import bgSrc from '../assets/bg.jpeg'
import introSrc from '../assets/intro.mp4'
import musicSrc from '../assets/music.mp3'
import solSrc from '../assets/sol.svg'

const WHATSAPP_NUMBER = '573195914270'
const EVENT_DATE = new Date('2026-08-29T18:00:00')

// ─── Parámetro de URL: ?max=N ─────────────────────
function getMaxPeople() {
  const params = new URLSearchParams(window.location.search)
  const val = parseInt(params.get('max'), 10)
  return (Number.isFinite(val) && val >= 1) ? val : 2
}

// ─── Estrellas ────────────────────────────────────
function generateStars(count = 40) {
  const container = document.querySelector('.stars-container')
  if (!container) return
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span')
    star.className = 'star'
    const size = 1.5 + Math.random() * 3.5
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      --dur: ${1.8 + Math.random() * 3.5}s;
      animation-delay: ${Math.random() * 5}s;
    `
    container.appendChild(star)
  }
}

// ─── Cuenta regresiva ─────────────────────────────
function updateCountdown() {
  const now = Date.now()
  const diff = EVENT_DATE.getTime() - now

  const daysEl    = document.getElementById('days')
  const hoursEl   = document.getElementById('hours')
  const minutesEl = document.getElementById('minutes')
  const secondsEl = document.getElementById('seconds')

  if (!daysEl) return

  if (diff <= 0) {
    daysEl.textContent    = '0'
    hoursEl.textContent   = '0'
    minutesEl.textContent = '0'
    secondsEl.textContent = '0'
    const titleEl = document.querySelector('.countdown-title')
    if (titleEl) titleEl.textContent = '¡Ya llegó el gran día!'
    return
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  daysEl.textContent    = String(days).padStart(2, '0')
  hoursEl.textContent   = String(hours).padStart(2, '0')
  minutesEl.textContent = String(minutes).padStart(2, '0')
  secondsEl.textContent = String(seconds).padStart(2, '0')
}

// ─── Sistema de modales ───────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id)
  if (!overlay) return
  overlay.setAttribute('aria-hidden', 'false')
  overlay.classList.add('is-open')
  document.body.classList.add('modal-open')
}

function closeModal(id) {
  const overlay = document.getElementById(id)
  if (!overlay) return
  overlay.setAttribute('aria-hidden', 'true')
  overlay.classList.remove('is-open')
  document.body.classList.remove('modal-open')
}

function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id)
    })
  })
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close))
  })
}

// ─── Personas ────────────────────────────────────
let peopleCount = 1
const maxPeople = getMaxPeople()

function renderPeopleFields(count) {
  const container = document.getElementById('people-fields')
  if (!container) return

  // Conservar valores ya ingresados al agregar/quitar personas
  const existing = []
  container.querySelectorAll('.person-entry').forEach((entry, i) => {
    existing[i] = {
      nombre: entry.querySelector('.field-nombre')?.value ?? '',
      doc:    entry.querySelector('.field-doc')?.value ?? '',
    }
  })

  container.innerHTML = ''

  for (let i = 0; i < count; i++) {
    const div = document.createElement('div')
    div.className = 'person-entry'
    div.innerHTML = `
      <p class="person-title">Persona ${i + 1}</p>
      <div class="field-group">
        <label class="field-label" for="nombre-${i}">Nombre completo</label>
        <input class="field-input field-nombre" type="text" id="nombre-${i}"
               placeholder="Nombre completo" autocomplete="off">
      </div>
      <div class="field-group">
        <label class="field-label" for="doc-${i}">Documento de identidad</label>
        <input class="field-input field-doc" type="text" id="doc-${i}"
               placeholder="CC 1234567890" autocomplete="off" inputmode="numeric">
      </div>
    `
    container.appendChild(div)

    // Restaurar valores previos
    if (existing[i]) {
      div.querySelector('.field-nombre').value = existing[i].nombre
      div.querySelector('.field-doc').value    = existing[i].doc
    }
  }
}

function capDishQuantities(limit) {
  let total = quantities.valenciana + quantities.carnes
  if (total <= limit) return
  // Reducir proporcionalmente empezando por carnes
  const excess = total - limit
  const reduceCarnes = Math.min(quantities.carnes, excess)
  quantities.carnes -= reduceCarnes
  const remaining = excess - reduceCarnes
  quantities.valenciana -= remaining
  updateQtyDisplay('valenciana')
  updateQtyDisplay('carnes')
}

function initPeopleStepper() {
  const countEl  = document.getElementById('count-people')
  const noteEl   = document.getElementById('people-max-note')
  const incBtn   = document.getElementById('inc-people')
  const decBtn   = document.getElementById('dec-people')

  if (noteEl) {
    noteEl.textContent = `Máximo ${maxPeople} persona${maxPeople !== 1 ? 's' : ''} por invitación`
  }

  renderPeopleFields(peopleCount)

  if (incBtn) {
    incBtn.addEventListener('click', () => {
      if (peopleCount < maxPeople) {
        peopleCount++
        if (countEl) countEl.textContent = peopleCount
        renderPeopleFields(peopleCount)
      }
    })
  }

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      if (peopleCount > 1) {
        peopleCount--
        if (countEl) countEl.textContent = peopleCount
        renderPeopleFields(peopleCount)
        capDishQuantities(peopleCount)
      }
    })
  }
}

// ─── Platos ───────────────────────────────────────
const quantities = { valenciana: 0, carnes: 0 }

function updateQtyDisplay(dish) {
  const el = document.getElementById(`qty-${dish}`)
  if (el) el.textContent = quantities[dish]
}

function bindQtyControls() {
  const dishes = ['valenciana', 'carnes']
  dishes.forEach(dish => {
    const incBtn = document.getElementById(`inc-${dish}`)
    const decBtn = document.getElementById(`dec-${dish}`)

    if (incBtn) {
      incBtn.addEventListener('click', () => {
        if (quantities.valenciana + quantities.carnes < peopleCount) {
          quantities[dish]++
          updateQtyDisplay(dish)
          hideError()
        }
      })
    }
    if (decBtn) {
      decBtn.addEventListener('click', () => {
        if (quantities[dish] > 0) {
          quantities[dish]--
          updateQtyDisplay(dish)
        }
      })
    }
  })
}

// ─── Validación y envío ───────────────────────────
function showError(msg) {
  const el = document.getElementById('plato-error')
  if (!el) return
  el.textContent = msg
  el.style.display = 'block'
}

function hideError() {
  const el = document.getElementById('plato-error')
  if (el) el.style.display = 'none'
}

function buildMessage() {
  const lines = ['Confirmo mi asistencia a la fiesta de Marianna.', '']

  lines.push('Asistentes:')
  for (let i = 0; i < peopleCount; i++) {
    const nombre = document.getElementById(`nombre-${i}`)?.value.trim() ?? ''
    const doc    = document.getElementById(`doc-${i}`)?.value.trim() ?? ''
    lines.push(`${i + 1}. ${nombre} - ${doc}`)
  }

  const placa = document.getElementById('field-placa')?.value.trim().toUpperCase()
  if (placa) {
    lines.push('')
    lines.push(`Vehículo: ${placa}`)
  }

  lines.push('')
  const parts = []
  if (quantities.valenciana > 0) parts.push(`${quantities.valenciana} Paella Valenciana`)
  if (quantities.carnes > 0)     parts.push(`${quantities.carnes} Paella de Carnes`)
  lines.push(`Platos: ${parts.join(' y ')}`)

  return lines.join('\n')
}

function initConfirmButton() {
  const btn = document.getElementById('btn-confirm-plato')
  if (!btn) return

  btn.addEventListener('click', () => {
    // Validar nombres y documentos
    for (let i = 0; i < peopleCount; i++) {
      const nombre = document.getElementById(`nombre-${i}`)?.value.trim()
      const doc    = document.getElementById(`doc-${i}`)?.value.trim()
      if (!nombre || !doc) {
        showError(`Completa el nombre y documento de la Persona ${i + 1}.`)
        document.getElementById(`nombre-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }

    // Validar al menos un plato
    if (quantities.valenciana + quantities.carnes === 0) {
      showError('Selecciona al menos un plato.')
      return
    }

    hideError()
    const msg = encodeURIComponent(buildMessage())
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  })
}

// ─── Botón de navegación ─────────────────────────
function initNavButtons() {
  const btnConfirmar = document.getElementById('btn-confirmar')
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => openModal('modal-plato'))
  }
}

// ─── Faroles ──────────────────────────────────────
function initLanterns(solHref) {
  const container = document.querySelector('.lanterns-container')
  if (!container) return

  container.innerHTML = [1, 2, 3, 4, 5, 6].map(i => `
    <svg class="lantern lantern-${i}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 115">
      <defs>
        <radialGradient id="lg${i}" cx="50%" cy="42%" r="56%">
          <stop offset="0%"   stop-color="#fffde0" stop-opacity="0.92"/>
          <stop offset="55%"  stop-color="#ffd700" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#e06000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Hilo superior -->
      <line x1="30" y1="0" x2="30" y2="11" stroke="#C9922A" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Tapa superior exterior -->
      <rect x="9" y="10" width="42" height="8" rx="4" fill="#C9922A"/>
      <!-- Tapa superior interior -->
      <rect x="15" y="17" width="30" height="6" rx="2" fill="#A87020"/>
      <!-- Cuerpo de cristal -->
      <rect x="7" y="22" width="46" height="54" rx="7" fill="#FFD740" fill-opacity="0.28" stroke="#C9922A" stroke-width="1.3"/>
      <!-- Sol central -->
      <image href="${solHref}" x="11" y="26" width="38" height="38" preserveAspectRatio="xMidYMid meet"/>
      <!-- Brillo interior (glow) -->
      <rect x="7" y="22" width="46" height="54" rx="7" fill="url(#lg${i})"/>
      <!-- Reflejo lateral del cristal -->
      <rect x="11" y="27" width="5" height="24" rx="2.5" fill="white" fill-opacity="0.18"/>
      <!-- Tapa inferior interior -->
      <rect x="15" y="75" width="30" height="6" rx="2" fill="#A87020"/>
      <!-- Tapa inferior exterior -->
      <rect x="9" y="80" width="42" height="8" rx="4" fill="#C9922A"/>
      <!-- Hilo inferior -->
      <line x1="30" y1="88" x2="30" y2="100" stroke="#C9922A" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Borla exterior -->
      <circle cx="30" cy="104" r="5" fill="#C9922A"/>
      <!-- Borla interior -->
      <circle cx="30" cy="104" r="3" fill="#FFD740"/>
      <!-- Brillo de borla -->
      <circle cx="28.5" cy="102.5" r="1" fill="white" fill-opacity="0.5"/>
    </svg>
  `).join('')
}

// ─── Bootstrap ────────────────────────────────────
function initIntroScreen() {
  const screen = document.getElementById('intro-screen')
  const video  = document.getElementById('intro-video')
  const audio  = document.getElementById('intro-audio')
  const hint   = document.getElementById('intro-hint')
  if (!screen || !video || !audio) return

  video.src = introSrc
  audio.src = musicSrc

  screen.addEventListener('click', () => {
    if (hint) hint.style.display = 'none'
    video.play()
    audio.play()
  }, { once: true })

  video.addEventListener('ended', () => {
    screen.style.opacity = '0'
    screen.addEventListener('transitionend', () => {
      screen.style.display = 'none'
    }, { once: true })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const bgImg = document.getElementById('bg-image')
  if (bgImg) bgImg.src = bgSrc

  initLanterns(solSrc)

  initIntroScreen()

  generateStars()
  updateCountdown()
  setInterval(updateCountdown, 1000)

  initModals()
  initNavButtons()
  initPeopleStepper()
  bindQtyControls()
  initConfirmButton()
})
