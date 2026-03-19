import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { createUser } from 'src/services/userService'

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    padding: theme.spacing(6)
  }
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: 'none',
  minWidth: 150
}))

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
  // ** State
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first: '',
    last: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'ORDER_BOOKER'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.first || !form.email || !form.password) {
      toast.error('Please fill required fields')
      return
    }

    try {
      setLoading(true)
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

      toast.success('User created successfully')
      refresh()
      onClose()
      setForm({ first: '', last: '', email: '', mobileNumber: '', password: '', role: 'ORDER_BOOKER' })
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Error creating user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomDialog open={open} onClose={onClose} fullWidth>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 8 }}>
        <Avatar 
          sx={{ 
            mr: 3, 
            background: 'linear-gradient(135deg, #7367F0 0%, #CE9FFC 100%)',
            width: 38,
            height: 38
          }}
        >
          <Icon icon='mdi:account-plus' fontSize='1.25rem' />
        </Avatar>
        <Typography variant='h5' sx={{ fontWeight: 700 }}>
          Add New User
        </Typography>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                placeholder='First Name'
                value={form.first}
                onChange={e => setForm({ ...form, first: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:account-outline' />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                placeholder='Last Name'
                value={form.last}
                onChange={e => setForm({ ...form, last: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:account-outline' />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder='Email'
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:email-outline' />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder='Phone'
                value={form.mobileNumber}
                onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:phone-outline' />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder='Password'
                type='password'
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:lock-outline' />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:shield-check-outline' />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              >
                {roles.map(r => (
                  <MenuItem key={r} value={r}>
                    {r.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, mt: 10 }}>
            <Button 
              onClick={onClose} 
              sx={{ 
                color: '#00AEEF', 
                textTransform: 'none', 
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              Cancel
            </Button>
            <StyledButton 
              variant='contained' 
              type='submit'
              disabled={loading}
              sx={{ 
                bgcolor: '#00AEEF',
                '&:hover': { bgcolor: '#0096ce' }
              }}
            >
              Create User
            </StyledButton>
          </Box>
        </form>
      </DialogContent>
    </CustomDialog>
  )
}

export default UserForm