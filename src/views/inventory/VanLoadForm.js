import { useState, useEffect } from 'react'

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
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 800,
    borderRadius: 16,
    padding: theme.spacing(4)
  }
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: 'none',
  '&:hover': { boxShadow: 'none' }
}))

const ItemCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}))

const VanLoadForm = ({ open, onClose, onSuccess }) => {
  // ** State
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [agents, setAgents] = useState([])
  const [products, setProducts] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  
  const [headerData, setHeaderData] = useState({
    warehouseId: '',
    deliveryAgentId: '',
    loadDate: new Date().toISOString().split('T')[0]
  })

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    cartons: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true)
        const [whRes, agentRes, prodRes] = await Promise.all([
          axios.get('/api/warehouses'),
          axios.get('/api/auth/users'),
          axios.get('/api/products', { params: { limit: 100 } })
        ])

        if (whRes.data.success) {
          setWarehouses(whRes.data.data?.warehouses || [])
        }
        
        // Filter only DELIVERY_AGENT role (case-insensitive)
        const allUsers = Array.isArray(agentRes.data) ? agentRes.data : []
        const deliveryAgents = allUsers.filter(u => u.role?.toUpperCase() === 'DELIVERY_AGENT')
        setAgents(deliveryAgents)

        if (prodRes.data.success) {
          setProducts(prodRes.data.data?.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch van load data:', error)
        toast.error('Failed to load required data')
      } finally {
        setInitialLoading(false)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const handleAddItem = () => {
    if (!currentItem.productId || !currentItem.cartons) {
      toast.error('Select product and quantity')
      return
    }

    const product = products.find(p => p._id === currentItem.productId)
    if (!product) return

    const existingIndex = selectedItems.findIndex(item => item.productId === currentItem.productId)
    if (existingIndex > -1) {
      const updated = [...selectedItems]
      updated[existingIndex].cartons = parseInt(updated[existingIndex].cartons) + parseInt(currentItem.cartons)
      setSelectedItems(updated)
    } else {
      setSelectedItems([...selectedItems, {
        productId: currentItem.productId,
        productName: product.productName,
        variant: product.variant,
        cartons: parseInt(currentItem.cartons),
        cartonConversion: product.cartonConversion || 1
      }])
    }

    setCurrentItem({ productId: '', cartons: '' })
  }

  const handleRemoveItem = (index) => {
    const updated = [...selectedItems]
    updated.splice(index, 1)
    setSelectedItems(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!headerData.warehouseId || !headerData.deliveryAgentId || selectedItems.length === 0) {
      toast.error('Please complete the form and add at least one item')
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        warehouseId: headerData.warehouseId,
        deliveryAgentId: headerData.deliveryAgentId,
        loadDate: headerData.loadDate,
        items: selectedItems.map(item => ({
          productId: item.productId,
          cartons: item.cartons,
          quantityPieces: item.cartons * item.cartonConversion
        }))
      }

      const response = await axios.post('/api/van-loads', payload)

      if (response.data.success) {
        toast.success('Van load created successfully')
        onSuccess()
        onClose()
        setHeaderData({ warehouseId: '', deliveryAgentId: '', loadDate: new Date().toISOString().split('T')[0] })
        setSelectedItems([])
      }
    } catch (error) {
      console.error('Failed to create van load:', error)
      toast.error(error.response?.data?.message || 'Failed to create van load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomDialog open={open} onClose={onClose} fullWidth>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
        <IconButton onClick={onClose} sx={{ mr: 2, color: 'text.secondary' }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 700, flexGrow: 1, textAlign: 'center' }}>
          Create Van Load
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={5}>
              {/* Header Fields */}
              <Grid item xs={12}>
                <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>From Warehouse</Typography>
                <TextField
                  select
                  fullWidth
                  value={headerData.warehouseId}
                  onChange={(e) => setHeaderData({ ...headerData, warehouseId: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='mdi:warehouse' />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }}
                >
                  {warehouses.map((wh) => (
                    <MenuItem key={wh._id} value={wh._id}>{wh.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>To Delivery Agent (Van)</Typography>
                <TextField
                  select
                  fullWidth
                  value={headerData.deliveryAgentId}
                  onChange={(e) => setHeaderData({ ...headerData, deliveryAgentId: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='mdi:truck-delivery-outline' />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }}
                >
                  {agents.map((agent) => (
                    <MenuItem key={agent._id} value={agent._id}>
                      {agent.fullName.first} {agent.fullName.last}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

              {/* Add Items Section */}
              <Grid item xs={12}>
                <Typography variant='h6' sx={{ mb: 4, fontWeight: 700 }}>Add Products to Load</Typography>
                <Grid container spacing={4} alignItems='center'>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label='Select Product'
                      value={currentItem.productId}
                      onChange={(e) => setCurrentItem({ ...currentItem, productId: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='mdi:package-variant-closed' />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    >
                      {products.map((prod) => (
                        <MenuItem key={prod._id} value={prod._id}>
                          {prod.productName} ({prod.variant})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label='Quantity (Cartons)'
                      type='number'
                      value={currentItem.cartons}
                      onChange={(e) => setCurrentItem({ ...currentItem, cartons: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='mdi:package-variant' />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button 
                      fullWidth 
                      variant='contained' 
                      onClick={handleAddItem}
                      startIcon={<Icon icon='mdi:plus' />}
                      sx={{ height: 48, borderRadius: 3, bgcolor: '#000' }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              {/* Items List */}
              <Grid item xs={12}>
                <Box sx={{ minHeight: 150, mt: 4 }}>
                  {selectedItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                      <Typography variant='body2'>No items added</Typography>
                    </Box>
                  ) : (
                    selectedItems.map((item, index) => (
                      <ItemCard key={index}>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{item.productName}</Typography>
                          <Typography variant='caption' color='text.secondary'>{item.variant} • {item.cartons} Cartons</Typography>
                        </Box>
                        <IconButton size='small' color='error' onClick={() => handleRemoveItem(index)}>
                          <Icon icon='mdi:close' />
                        </IconButton>
                      </ItemCard>
                    ))
                  )}
                </Box>
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <StyledButton
                  fullWidth
                  variant='contained'
                  type='submit'
                  disabled={loading || selectedItems.length === 0}
                  sx={{ 
                    bgcolor: '#E0E0E0',
                    color: loading ? 'inherit' : 'text.primary',
                    '&.Mui-disabled': { bgcolor: '#E0E0E0', opacity: 0.7 },
                    '&:hover': { bgcolor: '#D0D0D0' },
                    mt: 4
                  }}
                >
                  {loading ? <CircularProgress size={24} color='inherit' /> : `Create Load (${selectedItems.length} Items)`}
                </StyledButton>
              </Grid>
            </Grid>
          </form>
        )
        }
      </DialogContent>
    </CustomDialog>
  )
}

export default VanLoadForm
