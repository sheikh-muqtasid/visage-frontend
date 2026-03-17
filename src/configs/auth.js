export default {
  meEndpoint: '/api/auth/profile',
  loginEndpoint: '/api/auth/login',
  registerEndpoint: '/api/auth/register',
  logoutEndpoint: '/api/auth/logout',
  refreshEndpoint: '/api/auth/refresh',
  storageTokenKeyName: 'accessToken',
  storageRefreshTokenKeyName: 'refreshToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
