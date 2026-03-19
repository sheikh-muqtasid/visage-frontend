import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { getUsers } from 'src/services/userService'

// ** Custom Components
import UserForm from './UserForm'
import UserDetails from './UserDetails'

const roles = [
  { label: 'All', value: 'ALL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Warehouse', value: 'WAREHOUSE' },
  { label: 'Booker', value: 'BOOKER' },
  { label: 'Agent', value: 'AGENT' },
  { label: 'Accountant', value: 'ACCOUNTANT' },
  { label: 'Manager', value: 'MANAGER' }
]

const SummaryCard = styled(Card)(({ theme, color }) => ({
  borderRadius: 16,
  boxShadow: 'none',
  border: `1px solid ${alpha(color, 0.1)}`,
  backgroundColor: alpha(color, 0.05),
  height: '100%',
  textAlign: 'center',
  padding: theme.spacing(4),
  '& .count': {
    color: color,
    fontWeight: 700,
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1)
  },
  '& .label': {
    color: color,
    fontWeight: 500,
    opacity: 0.8
  }
}))

const FilterButton = styled(Button)(({ theme, active }) => ({
  borderRadius: 12,
  textTransform: 'none',
  padding: theme.spacing(2, 6),
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  fontWeight: 500,
  minWidth: 100,
  ...(active && {
    background: 'linear-gradient(135deg, #7367F0 0%, #CE9FFC 100%)',
    color: theme.palette.common.white,
    borderColor: 'transparent',
    '&:hover': {
      background: 'linear-gradient(135deg, #7367F0 0%, #CE9FFC 100%)',
      opacity: 0.9
    }
  })
}))

const UserCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  marginBottom: theme.spacing(4),
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: 'transparent'
  }
}))

const RoleBadge = styled(Box)(({ theme, role }) => {
  const colors = {
    SUPER_ADMIN: { bg: alpha('#00AEEF', 0.1), text: '#00AEEF' },
    ADMIN: { bg: alpha('#7367F0', 0.1), text: '#7367F0' },
    MANAGER: { bg: alpha('#8231D3', 0.1), text: '#8231D3' },
    ORDER_BOOKER: { bg: alpha('#28C76F', 0.1), text: '#28C76F' },
    DELIVERY_AGENT: { bg: alpha('#FF9F43', 0.1), text: '#FF9F43' },
    ACCOUNTANT: { bg: alpha('#EA5455', 0.1), text: '#EA5455' },
    WAREHOUSE_OFFICER: { bg: alpha('#4B4B4B', 0.1), text: '#4B4B4B' }
  }
  const color = colors[role] || colors.ADMIN
  
  return {
    padding: theme.spacing(0.5, 3),
    borderRadius: 8,
    backgroundColor: color.bg,
    color: color.text,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'none'
  }
})

const getAvatarColor = (role) => {
  const colors = {
    SUPER_ADMIN: 'linear-gradient(135deg, #7367F0 0%, #CE9FFC 100%)',
    ADMIN: 'linear-gradient(135deg, #32CC70 0%, #32DCB0 100%)',
    MANAGER: 'linear-gradient(135deg, #AB64F0 0%, #8231D3 100%)',
    ORDER_BOOKER: 'linear-gradient(135deg, #28C76F 0%, #48DA89 100%)',
    DELIVERY_AGENT: 'linear-gradient(135deg, #FF9F43 0%, #FFC085 100%)'
  }
  return colors[role] || colors.ADMIN
}

const UserList = () => {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [roleFilter, setRoleFilter] = useState('ALL')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await getUsers()
      setUsers(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length
  }), [users])

  const filteredUsers = useMemo(() => users.filter(user => {
    if (roleFilter === 'ALL') return true
    
    if (roleFilter === 'ADMIN') return ['SUPER_ADMIN', 'ADMIN'].includes(user.role)
    if (roleFilter === 'WAREHOUSE') return user.role === 'WAREHOUSE_OFFICER'
    if (roleFilter === 'BOOKER') return user.role === 'ORDER_BOOKER'
    if (roleFilter === 'AGENT') return user.role === 'DELIVERY_AGENT'
    if (roleFilter === 'ACCOUNTANT') return user.role === 'ACCOUNTANT'
    if (roleFilter === 'MANAGER') return user.role === 'MANAGER'
    
    return true
  }), [users, roleFilter])

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 8 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 700, flexGrow: 1, textAlign: 'center' }}>
          User Management
        </Typography>
        <Button
          variant='contained'
          startIcon={<Icon icon='mdi:plus' />}
          onClick={() => setOpenForm(true)}
          sx={{ 
            bgcolor: '#00AEEF',
            borderRadius: 3,
            textTransform: 'none',
            px: 6,
            '&:hover': { bgcolor: '#0096ce' }
          }}
        >
          Add
        </Button>
      </Box>

      <Grid container spacing={6} sx={{ mb: 8 }}>
        <Grid item xs={6}>
          <SummaryCard color='#00AEEF'>
            <div className='count'>{stats.total}</div>
            <div className='label'>Total</div>
          </SummaryCard>
        </Grid>
        <Grid item xs={6}>
          <SummaryCard color='#28C76F'>
            <div className='count'>{stats.active}</div>
            <div className='label'>Active</div>
          </SummaryCard>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Box sx={{ display: 'flex', gap: 3, mb: 8, overflowX: 'auto', pb: 2 }}>
        {roles.map(role => (
          <FilterButton
            key={role.value}
            active={roleFilter === role.value}
            onClick={() => setRoleFilter(role.value)}
          >
            {role.label}
          </FilterButton>
        ))}
      </Box>

      <Typography variant='h6' sx={{ mb: 6, fontWeight: 700 }}>Users</Typography>

      {/* User List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {filteredUsers.map(user => (
            <UserCard key={user._id} onClick={() => setSelectedUser(user)} sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ p: '16px 20px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      mr: 4, 
                      width: 48, 
                      height: 48, 
                      background: getAvatarColor(user.role),
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    {user.fullName?.first?.[0]}{user.fullName?.last?.[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      {user.fullName?.first} {user.fullName?.last}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
                      {user.email || user.mobileNumber || '---'}
                    </Typography>
                    {user.role === 'ORDER_BOOKER' && user.assignedRoutes?.length > 0 && (
                      <Typography variant='caption' sx={{ display: 'block', mt: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
                        • {user.assignedRoutes.map(r => r.name).join(', ')}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <RoleBadge role={user.role}>
                      {user.role?.replace('_', ' ')}
                    </RoleBadge>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: user.status === 'ACTIVE' ? '#28C76F' : '#EA5455',
                          mr: 1.5
                        }} 
                      />
                      <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </UserCard>
          ))}
          {filteredUsers.length === 0 && (
            <Box sx={{ py: 20, textAlign: 'center', opacity: 0.5 }}>
              <Icon icon='mdi:account-off-outline' fontSize='3rem' />
              <Typography sx={{ mt: 2 }}>No users found</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Forms */}
      <UserForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={fetchUsers}
      />

      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          refresh={fetchUsers}
        />
      )}
    </Box>
  )
}

export default UserList