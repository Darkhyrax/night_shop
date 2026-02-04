/**
 * Validación de configuración de seguridad
 * Se ejecuta al iniciar la aplicación
 */

export function validateSecurityConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const jwtSecret = process.env.JWT_SECRET;

  // En producción, JWT_SECRET es obligatorio
  if (nodeEnv === 'production' && !jwtSecret) {
    throw new Error(
      'CRITICAL: JWT_SECRET environment variable is not set. ' +
      'This is required for production. ' +
      'Set JWT_SECRET to a strong random string (min 32 characters).',
    );
  }

  // En desarrollo, advertir si se usa el valor por defecto
  if (nodeEnv === 'development' && !jwtSecret) {
    console.warn(
      '⚠️  WARNING: JWT_SECRET is not set. Using development default. ' +
      'This is insecure for production!',
    );
  }

  // Validar longitud mínima en producción
  if (nodeEnv === 'production' && jwtSecret && jwtSecret.length < 32) {
    throw new Error(
      'CRITICAL: JWT_SECRET must be at least 32 characters long for security. ' +
      `Current length: ${jwtSecret.length}`,
    );
  }

  // Validar que BCRYPT_SALT_ROUNDS esté configurado
  const bcryptSaltRounds = process.env.BCRYPT_SALT_ROUNDS;
  if (bcryptSaltRounds && (isNaN(Number(bcryptSaltRounds)) || Number(bcryptSaltRounds) < 10)) {
    console.warn(
      '⚠️  WARNING: BCRYPT_SALT_ROUNDS should be at least 10 for security. ' +
      `Current value: ${bcryptSaltRounds}`,
    );
  }

  console.log('✅ Security configuration validated');
}
