import type { AppointmentDraft, ApiAppointmentPayload } from '@models/appointment';

const pad = (value: number): string => String(value).padStart(2, '0');

export const tomorrowAt = (hour = 10, minute = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, minute, 0, 0);

  return date.toISOString();
};

export const uiAppointmentDraft = (): AppointmentDraft => {
  const date = new Date();
  date.setDate(date.getDate() + 2);

  return {
    serviceName: 'Konsultacja',
    providerName: 'Dr QA',
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: '10:00',
    patientNote: `Automatyczny test QA ${Date.now()}`
  };
};

export const apiAppointmentPayload = (): ApiAppointmentPayload => ({
  serviceId: process.env.QA_SERVICE_ID ?? 'service-qa-consultation',
  providerId: process.env.QA_PROVIDER_ID ?? 'provider-qa-doctor',
  startsAt: tomorrowAt(11, 30),
  patientNote: `API QA booking ${Date.now()}`
});
