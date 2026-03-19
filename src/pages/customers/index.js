import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import Fab from '@mui/material/Fab'
import Dialog from '@mui/material/Dialog'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

// ** Custom Components
import ShopForm from 'src/views/customers/ShopForm'

const ShopCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.01)
  }
}))

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    '& fieldset': {
      borderColor: theme.palette.divider
    }
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

const getColorForAvatar = (name) => {
  const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
  const index = name?.charCodeAt(0) % colors.length
  return colors[index] || colors[0]
}

const ShopManagement = () => {
  // ** Hooks
  const router = useRouter()

  // ** State
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedShop, setSelectedShop] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [routeMap, setRouteMap] = useState({}) // customerId -> routeName

  const fetchShops = async () => {
    try {
      setLoading(true)
      const [shopsRes, routesRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/routes?limit=100')
      ])

      if (shopsRes.data.success) {
        setShops(shopsRes.data.data.customers || [])
      }

      if (routesRes.data.success) {
        const routes = routesRes.data.data.routes || []
        const map = {}
        routes.forEach(route => {
          if (Array.isArray(route.customers)) {
            route.customers.forEach(custId => {
              // custId might be an object or string
              const id = typeof custId === 'object' ? custId._id : custId
              map[id] = route.name
            })
          }
        })
        setRouteMap(map)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load shops or routes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  const handleAddShop = () => {
    setSelectedShop(null)
    setIsEdit(false)
    setOpenForm(true)
  }

  const handleEditShop = (shop) => {
    setSelectedShop(shop)
    setIsEdit(true)
    setOpenForm(true)
  }

  const handleDeleteShop = async (id) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        const response = await axios.delete(`/api/customers/${id}`)
        toast.success('Shop deleted successfully')
        fetchShops()
      } catch (error) {
        toast.error('Failed to delete shop')
      }
    }
  }

  const filteredShops = useMemo(() => shops.filter(shop =>
    shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [shops, searchQuery])

  return (
    <Box sx={{ p: 6 }}>
      <Stack direction='row' alignItems='center' sx={{ mb: 6 }}>
        <IconButton sx={{ mr: 2 }} onClick={() => window.history.back()}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
          Shop Management
        </Typography>
      </Stack>

      {/* Search and Filters */}
      <Box sx={{ mb: 6 }}>
        <SearchBox
          fullWidth
          placeholder='Search shops...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='mdi:magnify' />
              </InputAdornment>
            )
          }}
        />
        <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
          <Chip
            label='All'
            color='primary'
            onDelete={() => {}}
            deleteIcon={<Icon icon='mdi:check' />}
            sx={{ borderRadius: 1.5, height: 32, fontWeight: 600 }}
          />
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {filteredShops.map((shop) => (
            <ShopCard key={shop._id} onClick={() => router.push(`/customers/${shop._id}`)}>
              <CardContent sx={{ pb: '16px !important' }}>
                <Grid container spacing={4} alignItems='center'>
                  <Grid item>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: getColorForAvatar(shop.shopName || shop.name),
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    >
                      {(shop.shopName || shop.name)?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {shop.shopName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Icon icon='mdi:account-outline' fontSize='0.9rem' style={{ marginRight: 4, color: '#9e9e9e' }} />
                      <Typography variant='body2' color='text.secondary'>
                        {shop.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        icon={<Icon icon={routeMap[shop._id] ? 'mdi:map-marker-path' : 'mdi:map-marker-off'} fontSize='0.8rem' />}
                        label={routeMap[shop._id] || 'Unassigned'}
                        size='small'
                        sx={{
                          bgcolor: routeMap[shop._id] ? alpha('#2E7D32', 0.1) : alpha('#00AEEF', 0.1),
                          color: routeMap[shop._id] ? '#2E7D32' : '#00AEEF',
                          border: '1px solid',
                          borderColor: routeMap[shop._id] ? alpha('#2E7D32', 0.2) : alpha('#00AEEF', 0.2),
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-icon': { color: 'inherit' }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item>
                    <IconButton size='small' color='error' onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteShop(shop._id)
                    }}>
                      <Icon icon='mdi:delete-outline' />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </ShopCard>
          ))}
        </Box>
      )}

      <StyledFab color='primary' onClick={handleAddShop}>
        <Icon icon='mdi:plus' />
        Add Shop
      </StyledFab>

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
        <ShopForm
          shop={selectedShop}
          isEdit={isEdit}
          onClose={() => {
            setOpenForm(false)
            fetchShops()
          }}
        />
      </Dialog>
    </Box>
  )
}

export default ShopManagement
