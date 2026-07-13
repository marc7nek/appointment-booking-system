export type AppointmentStatus = 'booked' | 'cancelled' | 'completed' | 'no_show';

export type AppointmentDraft = {
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  patientNote?: string;
};

export type Appointment = AppointmentDraft & {
  id: string;
  status: AppointmentStatus;
  patientEmail: string;
};

export type ApiAppointmentPayload = {
  serviceId: string;
  providerId: string;
  startsAt: string;
  patientNote?: string;
};
