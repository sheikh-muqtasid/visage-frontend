// import { useState } from 'react'
// import { updateUser, deleteUser } from 'src/services/userService'

// const UserDetails = ({ user, onClose, refresh }) => {
//   const [data, setData] = useState(user)

//   const handleUpdate = async () => {
//     await updateUser(user._id, data)
//     refresh()
//     onClose()
//   }

//   const handleDelete = async () => {
//     await deleteUser(user._id)
//     refresh()
//     onClose()
//   }

//   return (
//     <div className='card'>
//       <input
//         value={data.fullName.first}
//         onChange={e => setData({ ...data, fullName: { ...data.fullName, first: e.target.value } })}
//       />

//       <button onClick={handleUpdate}>Update</button>
//       <button onClick={handleDelete}>Delete</button>
//     </div>
//   )
// }

// export default UserDetails

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem
} from '@mui/material'

import { updateUser, deleteUser } from 'src/services/userService'

const roles = [
  'SUPER_ADMIN',
  'ADMIN',
  'WAREHOUSE_OFFICER',
  'ORDER_BOOKER',
  'DELIVERY_AGENT',
  'ACCOUNTANT',
  'MANAGER'
]

const UserDetails = ({ user, onClose, refresh }) => {
  const [data, setData] = useState({
    fullName: { first: '', last: '' },
    email: '',
    mobileNumber: '',
    role: ''
  })

  // ✅ SAFE LOAD
  useEffect(() => {
    if (user) {
      setData({
        fullName: {
          first: user.fullName?.first || '',
          last: user.fullName?.last || ''
        },
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        role: user.role || ''
      })
    }
  }, [user])

  // ✅ UPDATE USER
  const handleUpdate = async () => {
    try {
      await updateUser(user._id, data)
      refresh()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Update failed')
    }
  }

  // ✅ DELETE USER
  const handleDelete = async () => {
    try {
      await deleteUser(user._id)
      refresh()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  return (
    <Drawer anchor='right' open={!!user} onClose={onClose}>
      <Box sx={{ width: 350, p: 4 }}>
        <Typography variant='h6' mb={3}>
          Edit User
        </Typography>

        {/* FIRST NAME */}
        <TextField
          fullWidth
          label='First Name'
          sx={{ mb: 2 }}
          value={data.fullName.first}
          onChange={e =>
            setData({
              ...data,
              fullName: { ...data.fullName, first: e.target.value }
            })
          }
        />

        {/* LAST NAME */}
        <TextField
          fullWidth
          label='Last Name'
          sx={{ mb: 2 }}
          value={data.fullName.last}
          onChange={e =>
            setData({
              ...data,
              fullName: { ...data.fullName, last: e.target.value }
            })
          }
        />

        {/* EMAIL */}
        <TextField
          fullWidth
          label='Email'
          sx={{ mb: 2 }}
          value={data.email}
          onChange={e => setData({ ...data, email: e.target.value })}
        />

        {/* PHONE */}
        <TextField
          fullWidth
          label='Phone'
          sx={{ mb: 2 }}
          value={data.mobileNumber}
          onChange={e => setData({ ...data, mobileNumber: e.target.value })}
        />

        {/* ROLE */}
        <TextField
          select
          fullWidth
          label='Role'
          sx={{ mb: 3 }}
          value={data.role}
          onChange={e => setData({ ...data, role: e.target.value })}
        >
          {roles.map(r => (
            <MenuItem key={r} value={r}>
              {r.replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>

        {/* ACTION BUTTONS */}
        <Box display='flex' justifyContent='space-between'>
          <Button color='error' onClick={handleDelete}>
            Delete
          </Button>

          <Button variant='contained' onClick={handleUpdate}>
            Update
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default UserDetails