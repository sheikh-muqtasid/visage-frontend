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
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 600,
    borderRadius: 16,
    padding: theme.spacing(4)
  }
}))

const FormWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(6)
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none'
  }
}))

const AddStockForm = ({ open, onClose, onSuccess }) => {
  // ** State
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    warehouseId: '',
    productId: '',
    cartons: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true)
        const [whRes, prodRes] = await Promise.all([
          axios.get('/api/warehouses'),
          axios.get('/api/products', { params: { limit: 100 } })
        ])

        if (whRes.data.success) {
          setWarehouses(whRes.data.data?.warehouses || [])
        }
        if (prodRes.data.success) {
          setProducts(prodRes.data.data?.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch form data:', error)
        toast.error('Failed to load warehouses or products')
      } finally {
        setInitialLoading(false)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.warehouseId || !formData.productId || !formData.cartons) {
      toast.error('Please fill all fields')
      return
    }

    try {
      setLoading(true)
      
      const selectedProduct = products.find(p => p._id === formData.productId)
      if (!selectedProduct) throw new Error('Product not found')

      // Calculate quantity (pieces) based on carton conversion
      const conversion = selectedProduct.cartonConversion || 1
      const quantity = parseInt(formData.cartons) * conversion

      const response = await axios.post('/api/inventory/opening-balance', {
        warehouseId: formData.warehouseId,
        productId: formData.productId,
        cartons: parseInt(formData.cartons),
        quantity: quantity
      })

      if (response.data.success) {
        toast.success('Stock added successfully')
        onSuccess()
        onClose()
        setFormData({ warehouseId: '', productId: '', cartons: '' })
      }
    } catch (error) {
      console.error('Failed to add stock:', error)
      toast.error(error.response?.data?.message || 'Failed to add stock')
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
          Add Stock
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <Typography variant='h6' color='primary' sx={{ fontWeight: 700, mb: 1 }}>
        Add Opening Balance
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 8 }}>
        This will add stock to the selected warehouse.
      </Typography>

      <DialogContent sx={{ p: 0 }}>
        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormWrapper>
              <TextField
                select
                fullWidth
                label='Select Warehouse'
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
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
                  <MenuItem key={wh._id} value={wh._id}>
                    {wh.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label='Select Product'
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
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
                    {prod.productName} ({prod.size})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label='Cartons'
                type='number'
                value={formData.cartons}
                onChange={(e) => setFormData({ ...formData, cartons: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:package-variant' />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />

              <StyledButton
                fullWidth
                variant='contained'
                type='submit'
                disabled={loading}
                sx={{ 
                  bgcolor: '#00AEEF',
                  '&:hover': { bgcolor: '#0096ce' },
                  mt: 4
                }}
              >
                {loading ? <CircularProgress size={24} color='inherit' /> : 'Add Stock'}
              </StyledButton>
            </FormWrapper>
          </form>
        )
        }
      </DialogContent>
    </CustomDialog>
  )
}

export default AddStockForm
