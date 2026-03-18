import axiosInstance from 'src/api/axiosInstance'

// GET USERS
export const getUsers = (params) => {
  return axiosInstance.get('/api/auth/users', { params })
}

// CREATE USER (register)
export const createUser = (data) => {
  return axiosInstance.post('/api/auth/register', data)
}

// UPDATE USER
export const updateUser = (id, data) => {
  return axiosInstance.put(`/api/auth/users/${id}`, data)
}

// DELETE USER
export const deleteUser = (id) => {
  return axiosInstance.delete(`/api/auth/users/${id}`)
}