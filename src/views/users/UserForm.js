import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem
} from '@mui/material'
import { useState } from 'react'
import { createUser } from 'src/services/userService'

const roles = [
  'SUPER_ADMIN',
  'ADMIN',
  'WAREHOUSE_OFFICER',
  'ORDER_BOOKER',
  'DELIVERY_AGENT',
  'ACCOUNTANT',
  'MANAGER'
]

const UserForm = ({ open, onClose, refresh }) => {
  const [form, setForm] = useState({
    first: '',
    last: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'ADMIN'
  })

  const handleSubmit = async () => {
    try {
      await createUser({
        fullName: {
          first: form.first,
          last: form.last
        },
        email: form.email,
        mobileNumber: form.mobileNumber,
        password: form.password,
        role: form.role
      })

      refresh()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error creating user')
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ p: 6, width: 400 }}>
        <Typography variant='h6' mb={4}>
          Add New User
        </Typography>

        <Box display='flex' gap={2} mb={2}>
          <TextField
            fullWidth
            label='First Name'
            onChange={e => setForm({ ...form, first: e.target.value })}
          />
          <TextField
            fullWidth
            label='Last Name'
            onChange={e => setForm({ ...form, last: e.target.value })}
          />
        </Box>

        <TextField
          fullWidth
          label='Email'
          sx={{ mb: 2 }}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <TextField
          fullWidth
          label='Phone'
          sx={{ mb: 2 }}
          onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
        />

        <TextField
          fullWidth
          label='Password'
          type='password'
          sx={{ mb: 2 }}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <TextField
          select
          fullWidth
          label='Role'
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          {roles.map(r => (
            <MenuItem key={r} value={r}>
              {r.replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>

        <Box display='flex' justifyContent='space-between' mt={4}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit}>
            Create User
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default UserForm