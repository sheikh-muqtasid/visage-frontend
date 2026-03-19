import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Fab from '@mui/material/Fab'
import Dialog from '@mui/material/Dialog'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { styled, alpha } from '@mui/material/styles'
import Avatar from '@mui/material/Avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

// ** Custom Components
import RouteForm from 'src/views/routes/RouteForm'
import AssignShops from 'src/views/routes/AssignShops'

const RouteCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  '& .MuiCardContent-root': {
    padding: theme.spacing(5)
  }
}))

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(6),
  right: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0, 4),
  width: 'auto',
  height: 48,
  textTransform: 'none',
  fontWeight: 600,
  '& svg': {
    marginRight: theme.spacing(2)
  }
}))

const RouteManagement = () => {
  // ** State
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [openAssign, setOpenAssign] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/routes')
      if (response.data.success) {
        setRoutes(Array.isArray(response.data.data.routes) ? response.data.data.routes : [])
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error)
      toast.error('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  const handleAddRoute = () => {
    setSelectedRoute(null)
    setIsEdit(false)
    setOpenForm(true)
  }

  const handleEditRoute = (route) => {
    setSelectedRoute(route)
    setIsEdit(true)
    setOpenForm(true)
  }

  const handleAssignShops = (route) => {
    setSelectedRoute(route)
    setOpenAssign(true)
  }

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        const response = await axios.delete(`/api/routes/${id}`)
        if (response.data.success) {
          toast.success('Route deleted successfully')
          fetchRoutes()
        }
      } catch (error) {
        toast.error('Failed to delete route')
      }
    }
  }

  const handleCloseForm = () => {
    setOpenForm(false)
    fetchRoutes()
  }

  const handleCloseAssign = () => {
    setOpenAssign(false)
    fetchRoutes()
  }

  return (
    <Box sx={{ p: 6 }}>
      <Stack direction='row' alignItems='center' sx={{ mb: 6 }}>
        <IconButton sx={{ mr: 2 }} onClick={() => window.history.back()}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
          Route Management
        </Typography>
      </Stack>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder='Search by route name or city...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 6 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Icon icon='mdi:magnify' color='text.secondary' />
            </InputAdornment>
          ),
          sx: { 
            borderRadius: 5, 
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px -5px rgba(0,0,0,0.1)',
            '& fieldset': { border: 'none' }
          }
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {routes
            .filter(route => 
              route.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              route.city?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((route, index) => (
            <RouteCard key={route._id}>
              <CardContent>
                <Grid container spacing={4} alignItems='center'>
                  <Grid item>
                    <Avatar sx={{ bgcolor: alpha('#2196F3', 0.1), color: '#2196F3' }}>
                      <Icon icon='mdi:telegram' />
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      {routes.length - index}. {route.name}
                    </Typography>
                    <Stack direction='row' spacing={4} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icon icon='mdi:map-marker' fontSize='1rem' style={{ marginRight: 4, color: '#9e9e9e' }} />
                        <Typography variant='body2' color='text.secondary'>{route.city || 'Mansehra'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icon icon='mdi:warehouse' fontSize='1rem' style={{ marginRight: 4, color: '#9e9e9e' }} />
                        <Typography variant='body2' color='text.secondary'>
                          {route.warehouseId?.name || 'Main Warehouse'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Chip 
                      label={route.status === 'ACTIVE' ? 'Active' : 'Inactive'} 
                      color={route.status === 'ACTIVE' ? 'success' : 'error'}
                      size='small'
                      variant='light'
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, pt: 4, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
                  <Grid container justifyContent='space-between' alignItems='center'>
                    <Stack direction='row' spacing={4} alignItems='center'>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icon icon='mdi:storefront' fontSize='1.2rem' style={{ marginRight: 8, color: '#616161' }} />
                        <Typography variant='body2'>{route.customers?.length || 0} Shops</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Icon icon='mdi:calendar-month' fontSize='1.2rem' style={{ marginRight: 8, color: '#616161' }} />
                      <Typography variant='body2'>
                        {new Date(route.assignedDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Box>

                <Grid container spacing={4} sx={{ mt: 4 }}>
                  <Grid item xs={12} sm={5}>
                    <Button 
                      fullWidth 
                      variant='outlined' 
                      startIcon={<Icon icon='mdi:store-plus' />}
                      onClick={() => handleAssignShops(route)}
                      sx={{ borderRadius: 10 }}
                    >
                      Assign Shops
                    </Button>
                  </Grid>
                  <Grid item xs={10} sm={6}>
                    <Button 
                      fullWidth 
                      variant='contained' 
                      color='primary'
                      startIcon={<Icon icon='mdi:pencil' />}
                      onClick={() => handleEditRoute(route)}
                      sx={{ borderRadius: 10, bgcolor: '#00AEEF' }}
                    >
                      Edit
                    </Button>
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <IconButton 
                      color='error' 
                      onClick={() => handleDeleteRoute(route._id)}
                      sx={{ bgcolor: alpha('#FF4C51', 0.1), borderRadius: 1 }}
                    >
                      <Icon icon='mdi:delete-outline' />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </RouteCard>
          ))}
        </Box>
      )}

      <StyledFab color='primary' onClick={handleAddRoute}>
        <Icon icon='mdi:plus' />
        Add Route
      </StyledFab>

      {/* Route Form Dialog */}
      <Dialog 
        fullWidth 
        maxWidth='sm' 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: 4, position: 'relative' } }}
      >
        <IconButton
          size='small'
          onClick={() => setOpenForm(false)}
          sx={{ position: 'absolute', right: '1rem', top: '1rem', color: 'text.secondary', zIndex: 1 }}
        >
          <Icon icon='tabler:x' />
        </IconButton>
        <RouteForm 
          route={selectedRoute} 
          isEdit={isEdit} 
          onClose={handleCloseForm} 
        />
      </Dialog>

      {/* Assign Shops Dialog */}
      <Dialog 
        fullScreen
        open={openAssign} 
        onClose={() => setOpenAssign(false)}
        sx={{ position: 'relative' }}
      >
        <IconButton
          size='small'
          onClick={() => setOpenAssign(false)}
          sx={{ position: 'absolute', right: '1rem', top: '1rem', color: 'text.secondary', zIndex: 1 }}
        >
          <Icon icon='tabler:x' />
        </IconButton>
        <AssignShops 
          route={selectedRoute} 
          onClose={handleCloseAssign} 
        />
      </Dialog>
    </Box>
  )
}

export default RouteManagement
