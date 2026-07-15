const state = {
  token: localStorage.getItem('qa-token'),
  redirectAfterLogin: null,
  user: null,
  selectedTime: '10:00',
  services: [],
  providers: []
};

const views = {
  login: document.querySelector('#login-view'),
  appointments: document.querySelector('#appointments-view'),
  booking: document.querySelector('#booking-view')
};

document.querySelector('#login-form').addEventListener('submit', login);
document.querySelector('[data-testid="demo-login-submit"]').addEventListener('click', demoLogin);
document.querySelector('#booking-form').addEventListener('submit', bookAppointment);
document.querySelector('#logout-button').addEventListener('click', logout);

document.querySelectorAll('[data-testid="time-slot"]').forEach((button) => {
  button.addEventListener('click', () => {
    state.selectedTime = button.dataset.time;
    document.querySelectorAll('[data-testid="time-slot"]').forEach((slot) => {
      slot.classList.toggle('selected', slot === button);
    });
  });
});

window.addEventListener('popstate', route);
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="/"]');

  if (!link) {
    return;
  }

  event.preventDefault();
  history.pushState({}, '', link.getAttribute('href'));
  route();
});

route();

async function route() {
  if (location.pathname === '/login') {
    hideAll();
    updateNavigation(false);
    views.login.hidden = false;
    return;
  }

  if (!(await ensureAuthenticated())) {
    redirectToLogin(location.pathname);
    return;
  }

  hideAll();
  updateNavigation(true);

  await loadReferenceData();

  if (location.pathname === '/appointments/new') {
    views.booking.hidden = false;
    prepareBookingForm();
    return;
  }

  views.appointments.hidden = false;
  await renderAppointments();
}

async function login(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  await loginWithCredentials({
    email: form.get('email'),
    password: form.get('password')
  });
}

async function demoLogin() {
  await loginWithCredentials({
    email: 'qa.patient@example.com',
    password: 'ChangeMe123!'
  });
}

async function loginWithCredentials(credentials) {
  const error = document.querySelector('[data-testid="login-error"]');
  error.hidden = true;

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    error.hidden = false;
    return;
  }

  const body = await response.json();
  state.token = body.accessToken;
  state.user = body.user;
  localStorage.setItem('qa-token', state.token);
  history.pushState({}, '', state.redirectAfterLogin || '/appointments');
  state.redirectAfterLogin = null;
  await route();
}

async function ensureAuthenticated() {
  if (!state.token) {
    return false;
  }

  const response = await fetch('/api/auth/me', {
    headers: { authorization: `Bearer ${state.token}` }
  });

  if (response.ok) {
    state.user = await response.json();
    return true;
  }

  state.token = null;
  state.user = null;
  localStorage.removeItem('qa-token');
  return false;
}

async function loadReferenceData() {
  if (state.services.length && state.providers.length) {
    return;
  }

  const [servicesResponse, providersResponse] = await Promise.all([
    fetch('/api/services'),
    fetch('/api/providers')
  ]);

  state.services = await servicesResponse.json();
  state.providers = await providersResponse.json();
}

function prepareBookingForm() {
  const serviceSelect = document.querySelector('[data-testid="service-select"]');
  const providerSelect = document.querySelector('[data-testid="provider-select"]');
  const dateInput = document.querySelector('[data-testid="date-input"]');

  serviceSelect.innerHTML = state.services
    .map((service) => `<option value="${service.id}">${service.name}</option>`)
    .join('');
  providerSelect.innerHTML = state.providers
    .map((provider) => `<option value="${provider.id}">${provider.name}</option>`)
    .join('');

  if (!dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().slice(0, 10);
  }

  document.querySelector('[data-time="10:00"]').classList.add('selected');
}

async function bookAppointment(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const startsAt = new Date(`${form.get('date')}T${state.selectedTime}:00`);
  const confirmation = document.querySelector('[data-testid="booking-confirmation"]');

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${state.token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      serviceId: form.get('serviceId'),
      providerId: form.get('providerId'),
      startsAt: startsAt.toISOString(),
      patientNote: form.get('patientNote')
    })
  });

  if (response.status === 401) {
    redirectToLogin('/appointments/new');
    return;
  }

  if (!response.ok) {
    confirmation.textContent = 'The appointment could not be booked.';
    confirmation.hidden = false;
    return;
  }

  const appointment = await response.json();
  confirmation.textContent = `${appointment.serviceName} has been booked for ${state.selectedTime}.`;
  confirmation.hidden = false;
}

async function renderAppointments() {
  const list = document.querySelector('#appointments-list');
  const response = await fetch('/api/appointments', {
    headers: { authorization: `Bearer ${state.token}` }
  });

  if (!response.ok) {
    redirectToLogin('/appointments');
    return;
  }

  const appointments = await response.json();
  list.innerHTML = appointments.length
    ? appointments.map(renderAppointmentCard).join('')
    : renderEmptyAppointments();

  list.querySelectorAll('[data-testid="cancel-appointment"]').forEach((button) => {
    button.addEventListener('click', async () => {
      await cancelAppointment(button.dataset.appointmentId);
      await renderAppointments();
    });
  });
}

function renderAppointmentCard(appointment) {
  const startsAt = new Date(appointment.startsAt);
  const statusText = appointment.status === 'cancelled' ? 'Cancelled' : 'Booked';
  const canCancel = appointment.status !== 'cancelled';

  return `
    <article data-testid="appointment-card" class="appointment-card">
      <div>
        <h2>${appointment.serviceName}</h2>
        <p>${appointment.providerName}</p>
        <p>${startsAt.toLocaleString('en-US')}</p>
        <span data-testid="appointment-status" class="status ${appointment.status}">
          ${statusText}
        </span>
      </div>
      ${
        canCancel
          ? `<button data-testid="cancel-appointment" data-appointment-id="${appointment.id}" type="button">
              Cancel
            </button>`
          : ''
      }
    </article>
  `;
}

function renderEmptyAppointments() {
  return `
    <section class="empty-state">
      <h2>No appointments yet</h2>
      <p>Schedule your first appointment when you are ready.</p>
      <a class="button-link" href="/appointments/new">Schedule appointment</a>
    </section>
  `;
}

async function cancelAppointment(appointmentId) {
  const confirmed = window.confirm('Are you sure you want to cancel this appointment?');

  if (!confirmed) {
    return;
  }

  await fetch(`/api/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${state.token}` }
  });
}

function logout() {
  state.token = null;
  state.redirectAfterLogin = null;
  state.user = null;
  localStorage.removeItem('qa-token');
  history.pushState({}, '', '/login');
  route();
}

function redirectToLogin(returnPath) {
  state.redirectAfterLogin = returnPath;
  updateNavigation(false);
  history.replaceState({}, '', '/login');
  hideAll();
  views.login.hidden = false;
}

function updateNavigation(isAuthenticated) {
  document.querySelector('#appointments-link').hidden = !isAuthenticated;
  document.querySelector('#schedule-link').hidden = !isAuthenticated;
  document.querySelector('#logout-button').hidden = !isAuthenticated;

  const sessionLabel = document.querySelector('#session-label');
  sessionLabel.hidden = !isAuthenticated;
  sessionLabel.textContent = state.user ? state.user.email : '';
}

function hideAll() {
  Object.values(views).forEach((view) => {
    view.hidden = true;
  });
}
