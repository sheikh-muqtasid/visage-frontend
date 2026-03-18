// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'src/api/axiosInstance'

// ** Config
import authConfig from 'src/configs/auth'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        setLoading(true)
        await axios
          .get(authConfig.meEndpoint)
          .then(async response => {
            setLoading(false)
            const userData = response.data.userData || response.data
            if (userData && userData.role) {
              userData.role = userData.role.toLowerCase()
            }
            setUser({ ...userData })
          })
          .catch(() => {
            localStorage.removeItem('userData')
            localStorage.removeItem(authConfig.storageRefreshTokenKeyName)
            localStorage.removeItem(authConfig.storageTokenKeyName)
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login')
            }
          })
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params, errorCallback) => {
    axios
      .post(authConfig.loginEndpoint, params)
      .then(async response => {
        const userData = response.data.userData || {
          _id: response.data._id,
          fullName: response.data.fullName,
          email: response.data.email,
          role: response.data.role?.toLowerCase()
        }

        if (params.rememberMe) {
          window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          if (response.data.refreshToken) {
            window.localStorage.setItem(authConfig.storageRefreshTokenKeyName, response.data.refreshToken)
          }
          window.localStorage.setItem('userData', JSON.stringify(userData))
        } else {
          // If not rememberMe, we still need token for session, but maybe not in localStorage?
          // Vuexy usually puts it in localStorage anyway but clears on some actions, or we just put it.
          // Let's just follow the original logic and adapt
          window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          if (response.data.refreshToken) {
            window.localStorage.setItem(authConfig.storageRefreshTokenKeyName, response.data.refreshToken)
          }
        }

        const returnUrl = router.query.returnUrl
        setUser({ ...userData })
        
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    const refreshToken = window.localStorage.getItem(authConfig.storageRefreshTokenKeyName)
    if (refreshToken) {
      axios.post(authConfig.logoutEndpoint, { refreshToken }).catch(() => {})
    }
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem(authConfig.storageRefreshTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
