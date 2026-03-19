import { useState, useEffect } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { updateUser, deleteUser } from 'src/services/userService'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2.5, 6),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.9rem',
  boxShadow: 'none'
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

const UserDetails = ({ user, onClose, refresh }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    fullName: { first: '', last: '' },
    email: '',
    mobileNumber: '',
    role: ''
  })

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

  const handleUpdate = async () => {
    try {
      setLoading(true)
      await updateUser(user._id, data)
      toast.success('User updated successfully')
      refresh()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true)
        await deleteUser(user._id)
        toast.success('User deleted successfully')
        refresh()
        onClose()
      } catch (err) {
        console.error(err)
        toast.error('Delete failed')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Drawer 
      anchor='right' 
      open={!!user} 
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, borderRadius: '20px 0 0 20px' }
      }}
    >
      <Header>
        <Typography variant='h6' sx={{ fontWeight: 700 }}>Edit User Details</Typography>
        <IconButton onClick={onClose} size='small'>
          <Icon icon='mdi:close' />
        </IconButton>
      </Header>

      <Box sx={{ p: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 8 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mb: 4, 
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #7367F0 0%, #CE9FFC 100%)'
            }}
          >
            {data.fullName.first?.[0]}{data.fullName.last?.[0]}
          </Avatar>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>{data.fullName.first} {data.fullName.last}</Typography>
          <Typography variant='body2' color='text.secondary'>{data.role.replace('_', ' ')}</Typography>
        </Box>

        <Box component='form' sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <TextField
              fullWidth
              label='First Name'
              value={data.fullName.first}
              onChange={e => setData({ ...data, fullName: { ...data.fullName, first: e.target.value } })}
              InputProps={{ sx: { borderRadius: 3 } }}
            />
            <TextField
              fullWidth
              label='Last Name'
              value={data.fullName.last}
              onChange={e => setData({ ...data, fullName: { ...data.fullName, last: e.target.value } })}
              InputProps={{ sx: { borderRadius: 3 } }}
            />
          </Box>

          <TextField
            fullWidth
            label='Email'
            value={data.email}
            onChange={e => setData({ ...data, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='mdi:email-outline' />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 }
            }}
          />

          <TextField
            fullWidth
            label='Phone'
            value={data.mobileNumber}
            onChange={e => setData({ ...data, mobileNumber: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='mdi:phone-outline' />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 }
            }}
          />

          <TextField
            select
            fullWidth
            label='Role'
            value={data.role}
            onChange={e => setData({ ...data, role: e.target.value })}
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
        </Box>

        <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <StyledButton 
            fullWidth 
            variant='contained' 
            onClick={handleUpdate}
            disabled={loading}
            sx={{ bgcolor: '#00AEEF', '&:hover': { bgcolor: '#0096ce' } }}
          >
            Save Changes
          </StyledButton>
          <StyledButton 
            fullWidth 
            color='error' 
            variant='outlined' 
            onClick={handleDelete}
            disabled={loading}
            startIcon={<Icon icon='mdi:trash-can-outline' />}
            sx={{ borderColor: alpha('#EA5455', 0.5) }}
          >
            Delete User
          </StyledButton>
        </Box>
      </Box>
    </Drawer>
  )
}

export default UserDetails