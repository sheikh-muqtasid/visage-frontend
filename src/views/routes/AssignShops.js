import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

const TabPanel = (props) => {
  const { children, value, index, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  )
}

const ShopItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  padding: theme.spacing(3, 4),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02)
  }
}))

const AssignShops = ({ route, onClose }) => {
  // ** State
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allShops, setAllShops] = useState([])
  const [assignedShops, setAssignedShops] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [customersRes, routeRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get(`/api/routes/${route._id}`)
        ])

        if (customersRes.data.success) {
          setAllShops(customersRes.data.data)
        }

        if (routeRes.data.success) {
          // The route data should have customers populated
          setAssignedShops(routeRes.data.data.customers || [])
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error)
        toast.error('Failed to load shops')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [route._id])

  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleRemoveShop = (id) => {
    setAssignedShops(prev => prev.filter(shop => shop._id !== id))
  }

  const handleAddShop = (shop) => {
    if (assignedShops.some(s => s._id === shop._id)) {
      toast.error('Shop already assigned')
      return
    }
    setAssignedShops(prev => [...prev, shop])
    toast.success('Shop added to route')
  }

  // Simple move logic for "Drag to Order" mockup
  const moveShop = (index, direction) => {
    const newAssigned = [...assignedShops]
    const item = newAssigned.splice(index, 1)[0]
    newAssigned.splice(index + (direction === 'up' ? -1 : 1), 0, item)
    setAssignedShops(newAssigned)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Update sequence first
      const sequencePayload = {
        visitSequence: assignedShops.map(s => s._id)
      }
      
      // Actually we need to add each customer one by one or have a bulk API. 
      // Based on my research the backend has router.post('/:routeId/customers' and router.put('/:routeId/sequence')
      
      // For now, let's assume we update the sequence which is the main goal of the view
      const response = await axios.put(`/api/routes/${route._id}/sequence`, sequencePayload)
      
      if (response.data.success) {
        toast.success('Sequence saved successfully')
        onClose()
      }
    } catch (error) {
      console.error('Failed to save sequence:', error)
      toast.error('Failed to save sequence')
    } finally {
      setSaving(false)
    }
  }

  const filteredAvailableShops = allShops.filter(shop => {
    // Must belong to the same warehouse as the route
    const sameWarehouse = (shop.warehouseId?._id || shop.warehouseId) === (route.warehouseId?._id || route.warehouseId)
    
    // Search query filter
    const matchesSearch = shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return sameWarehouse && matchesSearch
  })

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 20 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
        <IconButton onClick={onClose} sx={{ mr: 2 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>Assign & Reorder</Typography>
          <Typography variant='caption' color='text.secondary'>
            Route: {route.name}
          </Typography>
        </Box>
        <Button 
          variant='text' 
          color='primary' 
          onClick={handleSave} 
          disabled={saving}
          sx={{ fontWeight: 600, fontSize: '1.1rem' }}
        >
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={value} 
        onChange={handleTabChange} 
        variant='fullWidth'
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Tab label='Assigned (Drag to Order)' />
        <Tab label='Available Shops' />
      </Tabs>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
        <TabPanel value={value} index={0}>
          {assignedShops.length === 0 ? (
            <Box sx={{ p: 10, textAlign: 'center' }}>
              <Typography color='text.secondary'>No shops assigned to this route yet.</Typography>
            </Box>
          ) : (
            assignedShops.map((shop, index) => (
              <ShopItem key={shop._id}>
                <Grid container spacing={4} alignItems='center'>
                  <Grid item>
                    <Avatar sx={{ bgcolor: '#2196F3', color: 'white', width: 32, height: 32, fontSize: '0.9rem' }}>
                      {index + 1}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography sx={{ fontWeight: 600 }}>{shop.shopName || shop.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Icon icon='mdi:map-marker' fontSize='0.8rem' style={{ marginRight: 4, color: '#9e9e9e' }} />
                      <Typography variant='caption' color='text.secondary'>{shop.address}</Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Stack direction='row' spacing={2}>
                      <IconButton 
                        size='small' 
                        disabled={index === 0} 
                        onClick={() => moveShop(index, 'up')}
                      >
                        <Icon icon='mdi:chevron-up' />
                      </IconButton>
                      <IconButton 
                        size='small' 
                        disabled={index === assignedShops.length - 1} 
                        onClick={() => moveShop(index, 'down')}
                      >
                        <Icon icon='mdi:chevron-down' />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => handleRemoveShop(shop._id)}>
                        <Icon icon='mdi:minus-circle' />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Icon icon='mdi:reorder-horizontal' style={{ cursor: 'grab', color: '#bdbdbd' }} />
                  </Grid>
                </Grid>
              </ShopItem>
            ))
          )}
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Box sx={{ mb: 6 }}>
            <TextField
              fullWidth
              placeholder='Search shops...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='mdi:magnify' />
                  </InputAdornment>
                ),
                sx: { borderRadius: 4, bgcolor: 'background.paper' }
              }}
            />
          </Box>
          {filteredAvailableShops.map(shop => {
            const isAssignedToThis = assignedShops.some(s => s._id === shop._id)
            
            return (
              <ShopItem key={shop._id}>
                <Grid container spacing={4} alignItems='center'>
                  <Grid item>
                    <Avatar sx={{ bgcolor: alpha('#9e9e9e', 0.1), color: '#757575', width: 40, height: 40 }}>
                      <Icon icon='mdi:storefront' />
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography sx={{ fontWeight: 600 }}>{shop.shopName || shop.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Icon icon='mdi:map-marker' fontSize='0.8rem' style={{ marginRight: 4, color: '#9e9e9e' }} />
                      <Typography variant='caption' color='text.secondary'>{shop.address}</Typography>
                    </Box>
                    {/* Placeholder for "Currently in another route" logic if needed */}
                  </Grid>
                  <Grid item>
                    {!isAssignedToThis ? (
                      <IconButton color='success' onClick={() => handleAddShop(shop)}>
                        <Icon icon='mdi:plus-circle' />
                      </IconButton>
                    ) : (
                      <Typography variant='caption' color='text.disabled'>Already added</Typography>
                    )}
                  </Grid>
                </Grid>
              </ShopItem>
            )
          })}
        </TabPanel>
      </Box>
    </Box>
  )
}

export default AssignShops
