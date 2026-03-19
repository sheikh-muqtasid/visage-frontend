import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

const CustomInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.background.paper, 0.8)
  }
}))

const ShopForm = ({ shop, isEdit, onClose }) => {
  // ** State
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [routes, setRoutes] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    mobileNumber: '',
    address: '',
    routeId: '',
    warehouseId: ''
  })

  const [warehouses, setWarehouses] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [routesRes, warehousesRes] = await Promise.all([
          axios.get('/api/routes'),
          axios.get('/api/warehouses?limit=100')
        ])

        if (routesRes.data.success) {
          setRoutes(Array.isArray(routesRes.data.data.routes) ? routesRes.data.data.routes : [])
        }

        if (warehousesRes.data.success) {
          const whData = warehousesRes.data.data
          setWarehouses(Array.isArray(whData.warehouses) ? whData.warehouses : [])
        }

        if (isEdit && shop) {
          setFormData({
            name: shop.name || '',
            shopName: shop.shopName || '',
            email: shop.email || '',
            mobileNumber: shop.mobileNumber || '',
            address: shop.address || '',
            routeId: shop.routeId || '',
            warehouseId: shop.warehouseId?._id || shop.warehouseId || ''
          })
        }
      } catch (error) {
        toast.error('Failed to load form data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [isEdit, shop])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }

      // Auto-select warehouse when route changes
      if (name === 'routeId' && value) {
        const selectedRoute = routes.find(r => r._id === value)
        if (selectedRoute) {
          // Ensure we extract the ID if it's an object
          const whId = selectedRoute.warehouseId?._id || selectedRoute.warehouseId
          updated.warehouseId = whId
        }
      }

      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.shopName || !formData.mobileNumber || !formData.address || !formData.warehouseId) {
      toast.error('Please fill in all required fields including Warehouse')
      return
    }

    try {
      setLoading(true)

      // Separate routeId from customer data as backend doesn't allow it in customer payload
      const { routeId, ...customerPayload } = formData

      let response
      if (isEdit) {
        response = await axios.put(`/api/customers/${shop._id}`, customerPayload)
      } else {
        response = await axios.post('/api/customers', customerPayload)
      }

      if (response.data.success) {
        const savedShop = response.data.data
        const shopId = isEdit ? shop._id : savedShop._id

        // Handle route assignment separately if routeId is provided
        if (routeId) {
          try {
            await axios.post(`/api/routes/${routeId}/customers`, { customerId: shopId })
          } catch (routeError) {
            const errorMsg = routeError.response?.data?.message || 'Route assignment failed'
            console.error('Failed to assign route:', routeError)
            toast.error(`Shop saved but: ${errorMsg}`, { duration: 5000 })
          }
        }

        toast.success(`Shop ${isEdit ? 'updated' : 'added'} successfully`)
        onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} shop`)
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <Box sx={{ p: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
        <IconButton onClick={onClose} sx={{ mr: 2 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h6' sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
          {isEdit ? 'Edit Shop' : 'Add New Shop'}
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ p: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomInput
                fullWidth
                placeholder='Shop Name'
                name='shopName'
                value={formData.shopName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:store' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomInput
                fullWidth
                placeholder='Owner/Contact Person'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:account' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomInput
                fullWidth
                placeholder='Email (Optional)'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:email' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomInput
                fullWidth
                placeholder='Phone Number'
                name='mobileNumber'
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:phone' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomInput
                fullWidth
                placeholder='Full Address (include Area)'
                name='address'
                value={formData.address}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:map-marker-distance' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Set Location on Map Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant='outlined'
                startIcon={<Icon icon='mdi:map-marker-radius' />}
                sx={{
                  borderRadius: 10,
                  py: 2,
                  textTransform: 'none',
                  borderColor: '#00AEEF',
                  color: '#00AEEF',
                  '&:hover': {
                    borderColor: '#00AEEF',
                    bgcolor: alpha('#00AEEF', 0.05)
                  }
                }}
              >
                Set Location on Map
              </Button>
            </Grid>

            {/* Assign to Route Dropdown */}
            <Grid item xs={12}>
              <CustomInput
                select
                fullWidth
                label='Assign to Route (Optional)'
                name='routeId'
                value={formData.routeId}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:telegram' />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value=''>No Route</MenuItem>
                {routes.map(route => (
                  <MenuItem key={route._id} value={route._id}>
                    {route.name}
                  </MenuItem>
                ))}
              </CustomInput>
            </Grid>

            {/* Warehouse Dropdown (Required) */}
            <Grid item xs={12}>
              <CustomInput
                select
                fullWidth
                label={formData.routeId ? 'Warehouse (Locked to Route)' : 'Select Warehouse'}
                name='warehouseId'
                value={formData.warehouseId}
                onChange={handleChange}
                required
                disabled={!!formData.routeId} // Disable if route is selected
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon={formData.routeId ? 'mdi:lock-outline' : 'mdi:warehouse'} />
                    </InputAdornment>
                  )
                }}
              >
                {warehouses.map(wh => (
                  <MenuItem key={wh._id} value={wh._id}>
                    {wh.name}
                  </MenuItem>
                ))}
              </CustomInput>
              <Typography variant='caption' sx={{ ml: 2, color: formData.routeId ? 'primary.main' : 'text.secondary' }}>
                {formData.routeId
                  ? '* Locked to match selected route'
                  : '* Store must be associated with a warehouse'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ px: 6, pb: 6 }}>
          <Button
            fullWidth
            type='submit'
            variant='contained'
            disabled={loading}
            sx={{
              py: 3,
              borderRadius: 3,
              bgcolor: '#00AEEF',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#0096ce'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : (isEdit ? 'Update Shop' : 'Create Shop')}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default ShopForm
