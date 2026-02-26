export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  jwtTokenKey: 'auth_token',
  jwtRefreshTokenKey: 'refresh_token',
  tokenExpirationTime: 3600000,
  sessionTimeout: 1800000,
  demoAccounts: [
    { label: 'Administrateur', email: 'admin@cabinet-medical.com', password: 'Admin123!', icon: 'admin_panel_settings' },
    { label: 'Médecin', email: 'medecin@cabinet-medical.com', password: 'Medecin123!', icon: 'medical_services' },
    { label: 'Secrétaire', email: 'secretaire@cabinet-medical.com', password: 'Secretaire123!', icon: 'badge' },
    { label: 'Patient', email: 'patient@cabinet-medical.com', password: 'Patient123!', icon: 'person' }
  ]
};
