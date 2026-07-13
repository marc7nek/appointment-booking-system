export type TestUser = {
  email: string;
  password: string;
};

const readEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  baseUrl: readEnv('BASE_URL', 'http://localhost:3000'),
  apiUrl: readEnv('API_URL', 'http://localhost:3000/api'),
  patient: {
    email: readEnv('QA_PATIENT_EMAIL', 'qa.patient@example.com'),
    password: readEnv('QA_PATIENT_PASSWORD', 'ChangeMe123!')
  } satisfies TestUser,
  admin: {
    email: readEnv('QA_ADMIN_EMAIL', 'qa.admin@example.com'),
    password: readEnv('QA_ADMIN_PASSWORD', 'ChangeMe123!')
  } satisfies TestUser,
  db: {
    host: readEnv('DB_HOST', 'localhost'),
    port: Number(readEnv('DB_PORT', '5432')),
    database: readEnv('DB_NAME', 'appointments'),
    user: readEnv('DB_USER', 'appointments_user'),
    password: readEnv('DB_PASSWORD', 'appointments_password'),
    ssl: readEnv('DB_SSL', 'false') === 'true'
  }
};
