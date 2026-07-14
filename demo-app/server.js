const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');

const users = [
  {
    id: 'user-patient-qa',
    email: process.env.QA_PATIENT_EMAIL || 'qa.patient@example.com',
    password: process.env.QA_PATIENT_PASSWORD || 'ChangeMe123!',
    role: 'patient'
  },
  {
    id: 'user-admin-qa',
    email: process.env.QA_ADMIN_EMAIL || 'qa.admin@example.com',
    password: process.env.QA_ADMIN_PASSWORD || 'ChangeMe123!',
    role: 'admin'
  }
];

const sessions = new Map();
const appointments = new Map();

const services = [
  { id: 'service-qa-consultation', name: 'Consultation', durationMinutes: 30 },
  { id: 'service-qa-control', name: 'Follow-up visit', durationMinutes: 20 }
];

const providers = [
  { id: 'provider-qa-doctor', name: 'Dr QA' },
  { id: 'provider-qa-specialist', name: 'QA Specialist' }
];

seedAppointment();

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      await handleApi(req, res);
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: 'Internal server error', details: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Demo appointment app: http://${host}:${port}`);
  console.log(`API: http://${host}:${port}/api`);
});

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${host}:${port}`);

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readJson(req);
    const user = users.find((candidate) => {
      return candidate.email === body.email && candidate.password === body.password;
    });

    if (!user) {
      sendJson(res, 401, { error: 'Invalid credentials' });
      return;
    }

    const token = crypto.randomUUID();
    sessions.set(token, user.id);
    sendJson(res, 200, {
      accessToken: token,
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/services') {
    sendJson(res, 200, services);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/providers') {
    sendJson(res, 200, providers);
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/__debug/appointments/')) {
    const id = url.pathname.split('/').pop();
    const appointment = appointments.get(id);

    if (!appointment) {
      sendJson(res, 404, { error: 'Appointment not found' });
      return;
    }

    sendJson(res, 200, toDbRow(appointment));
    return;
  }

  const user = authenticate(req);
  if (!user) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/appointments') {
    const userAppointments = Array.from(appointments.values()).filter(
      (appointment) => appointment.patientId === user.id
    );
    sendJson(res, 200, userAppointments.map(toApiAppointment));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/appointments') {
    const body = await readJson(req);
    const service = services.find((candidate) => candidate.id === body.serviceId);
    const provider = providers.find((candidate) => candidate.id === body.providerId);

    if (!service || !provider || !body.startsAt) {
      sendJson(res, 400, { error: 'serviceId, providerId and startsAt are required' });
      return;
    }

    const appointment = {
      id: crypto.randomUUID(),
      patientId: user.id,
      patientEmail: user.email,
      serviceId: service.id,
      serviceName: service.name,
      providerId: provider.id,
      providerName: provider.name,
      startsAt: new Date(body.startsAt).toISOString(),
      patientNote: body.patientNote || '',
      status: 'booked',
      createdAt: new Date().toISOString(),
      cancelledAt: null
    };

    appointments.set(appointment.id, appointment);
    sendJson(res, 201, toApiAppointment(appointment));
    return;
  }

  const appointmentMatch = url.pathname.match(/^\/api\/appointments\/([^/]+)(?:\/cancel)?$/);
  if (appointmentMatch) {
    const appointment = appointments.get(appointmentMatch[1]);

    if (!appointment || appointment.patientId !== user.id) {
      sendJson(res, 404, { error: 'Appointment not found' });
      return;
    }

    if (req.method === 'GET' && !url.pathname.endsWith('/cancel')) {
      sendJson(res, 200, toApiAppointment(appointment));
      return;
    }

    if (req.method === 'PATCH' && url.pathname.endsWith('/cancel')) {
      appointment.status = 'cancelled';
      appointment.cancelledAt = new Date().toISOString();
      appointments.set(appointment.id, appointment);
      sendJson(res, 200, toApiAppointment(appointment));
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${host}:${port}`);
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(publicDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType =
    {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8'
    }[ext] || 'application/octet-stream';

  res.writeHead(200, { 'content-type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

function authenticate(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId = sessions.get(token);

  return users.find((user) => user.id === userId);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*'
  });
  res.end(JSON.stringify(body));
}

function sendText(res, status, body) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(body);
}

function toApiAppointment(appointment) {
  return {
    id: appointment.id,
    status: appointment.status,
    serviceId: appointment.serviceId,
    serviceName: appointment.serviceName,
    providerId: appointment.providerId,
    providerName: appointment.providerName,
    startsAt: appointment.startsAt,
    patientNote: appointment.patientNote,
    cancelledAt: appointment.cancelledAt
  };
}

function toDbRow(appointment) {
  return {
    id: appointment.id,
    status: appointment.status,
    patient_email: appointment.patientEmail,
    starts_at: appointment.startsAt,
    cancelled_at: appointment.cancelledAt
  };
}

function seedAppointment() {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1);
  startsAt.setHours(9, 0, 0, 0);

  const appointment = {
    id: 'seed-appointment-1',
    patientId: 'user-patient-qa',
    patientEmail: users[0].email,
    serviceId: services[0].id,
    serviceName: services[0].name,
    providerId: providers[0].id,
    providerName: providers[0].name,
    startsAt: startsAt.toISOString(),
    patientNote: 'Seed appointment for cancellation testing',
    status: 'booked',
    createdAt: new Date().toISOString(),
    cancelledAt: null
  };

  appointments.set(appointment.id, appointment);
}
