import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Styled Components

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#2196F3',
  fontWeight: 600,
  fontSize: '1.1rem',
  marginBottom: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    width: 3,
    height: 20,
    backgroundColor: '#2196F3',
    marginRight: theme.spacing(3),
    borderRadius: 4
  }
}))

const CustomInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.background.paper, 0.8)
  }
}))


const RouteForm = ({ route, isEdit, onClose }) => {
  // ** State
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [bookers, setBookers] = useState([])
  const [deliveryAgents, setDeliveryAgents] = useState([])
  
  const [formData, setFormData] = useState({
    name: '',
    city: 'Mansehra',
    warehouseId: '',
    orderBookerId: '',
    deliveryAgentId: '',
    assignedDate: new Date()
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [warehousesRes, usersRes] = await Promise.all([
          axios.get('/api/warehouses'),
          axios.get('/api/auth/users')
        ])

        if (warehousesRes.data.success) {
          setWarehouses(Array.isArray(warehousesRes.data.data.warehouses) ? warehousesRes.data.data.warehouses : [])
        }

        const allUsers = usersRes.data.success ? usersRes.data.data : usersRes.data
        if (Array.isArray(allUsers)) {
          setBookers(allUsers.filter(u => u.role === 'ORDER_BOOKER' || u.role === 'admin' || u.role === 'ADMIN'))
          setDeliveryAgents(allUsers.filter(u => u.role === 'DELIVERY_AGENT' || u.role === 'admin' || u.role === 'ADMIN'))
        }

        if (isEdit && route) {
          setFormData({
            name: route.name || '',
            city: route.city || 'Mansehra',
            warehouseId: route.warehouseId?._id || route.warehouseId || '',
            orderBookerId: route.orderBookerId?._id || route.orderBookerId || '',
            deliveryAgentId: route.deliveryAgentId?._id || route.deliveryAgentId || '',
            assignedDate: new Date(route.assignedDate)
          })
        }
      } catch (error) {
        console.error('Failed to fetch form data:', error)
        toast.error('Failed to load form data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [isEdit, route])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const nextState = { ...prev, [name]: value }
      
      // Sync name with city change
      if (name === 'city') {
        const dateStr = prev.assignedDate ? new Date(prev.assignedDate).toLocaleDateString() : new Date().toLocaleDateString()
        nextState.name = `${value} Route ${dateStr}`
      }
      
      return nextState
    })
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({ 
      ...prev, 
      assignedDate: date,
      name: `${prev.city} Route ${date ? new Date(date).toLocaleDateString() : ''}`
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Simple validation
    if (!formData.city || !formData.warehouseId || !formData.orderBookerId || !formData.deliveryAgentId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...formData,
        name: formData.name || `${formData.city} Route ${formData.assignedDate.toLocaleDateString()}`
      }

      let response
      if (isEdit) {
        response = await axios.put(`/api/routes/${route._id}`, payload)
      } else {
        response = await axios.post('/api/routes', payload)
      }

      if (response.data.success) {
        toast.success(isEdit ? 'Route updated successfully' : 'Route created successfully')
        onClose()
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} route`)
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
          {isEdit ? 'Edit Route' : 'Add New Route'}
        </Typography>
        <Box sx={{ width: 40 }} /> {/* Spacer to center title */}
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ p: 6 }}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <CustomInput
                select
                fullWidth
                label='City'
                name='city'
                value={formData.city}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:city' />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value='Mansehra'>Mansehra</MenuItem>
                <MenuItem value='Abbottabad'>Abbottabad</MenuItem>
                <MenuItem value='Hazara'>Hazara</MenuItem>
              </CustomInput>
            </Grid>

            <Grid item xs={12}>
              <DatePickerWrapper>
                <DatePicker
                  selected={formData.assignedDate}
                  onChange={handleDateChange}
                  customInput={
                    <CustomInput
                      fullWidth
                      label='Select Date'
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='mdi:calendar-range' />
                          </InputAdornment>
                        )
                      }}
                    />
                  }
                />
              </DatePickerWrapper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 4, mb: 2 }}>
                <SectionTitle variant='subtitle1'>Team Assignment</SectionTitle>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <CustomInput
                      select
                      fullWidth
                      label='Assign Booker'
                      name='orderBookerId'
                      value={formData.orderBookerId}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='mdi:account-edit' />
                          </InputAdornment>
                        )
                      }}
                    >
                      {bookers.map(booker => (
                        <MenuItem key={booker._id} value={booker._id}>
                          {booker.fullName?.first ? `${booker.fullName.first} ${booker.fullName.last}` : (booker.fullName || booker.email || 'No Name')}
                        </MenuItem>
                      ))}
                    </CustomInput>
                  </Grid>

                  <Grid item xs={12}>
                    <CustomInput
                      select
                      fullWidth
                      label='Assign Delivery Agent'
                      name='deliveryAgentId'
                      value={formData.deliveryAgentId}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='mdi:truck-delivery' />
                          </InputAdornment>
                        )
                      }}
                    >
                      {deliveryAgents.map(agent => (
                        <MenuItem key={agent._id} value={agent._id}>
                          {agent.fullName?.first ? `${agent.fullName.first} ${agent.fullName.last}` : (agent.fullName || agent.email || 'No Name')}
                        </MenuItem>
                      ))}
                    </CustomInput>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 4, mb: 2 }}>
                <SectionTitle variant='subtitle1'>Inventory Source</SectionTitle>
                <CustomInput
                  select
                  fullWidth
                  label='Assign Warehouse'
                  name='warehouseId'
                  value={formData.warehouseId}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='mdi:warehouse' />
                      </InputAdornment>
                    )
                  }}
                >
                  {warehouses.map(warehouse => (
                    <MenuItem key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </CustomInput>
                <Typography variant='caption' sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  <Icon icon='mdi:information-outline' fontSize='0.8rem' style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Stock will be deducted from this warehouse.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: 6, position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: theme => `1px solid ${theme.palette.divider}` }}>
          <Button 
            fullWidth 
            type='submit' 
            variant='contained' 
            disableElevation
            disabled={loading}
            sx={{ 
              py: 3, 
              borderRadius: 2, 
              bgcolor: '#00AEEF',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : (isEdit ? 'Update Route' : 'Save Route')}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default RouteForm
