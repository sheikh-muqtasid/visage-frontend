import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

const HeaderBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#00AEEF',
  color: theme.palette.common.white,
  padding: theme.spacing(4, 6),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}))

const ProductItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  '& .MuiCardContent-root': {
    padding: theme.spacing(4)
  }
}))

const QtyInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: 32,
    fontSize: '0.875rem',
    width: 60,
    '& input': {
      textAlign: 'center',
      padding: 0
    }
  }
}))

const CreateOrder = () => {
  // ** Hooks
  const router = useRouter()
  const { shopId, routeId } = router.query

  // ** State
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentType, setPaymentType] = useState('CASH')
  const [cart, setCart] = useState({}) // { productId: { cartons: 0, pieces: 0 } }

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return
      try {
        setLoading(true)
        const [customerRes, productsRes] = await Promise.all([
          axios.get(`/api/customers/${shopId}`),
          axios.get('/api/products', { params: { limit: 100 } })
        ])

        if (customerRes.data.success) {
          setShop(customerRes.data.data)
        }

        if (productsRes.data.success) {
          setProducts(productsRes.data.data.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch order creation data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [shopId])

  const handleQtyChange = (productId, type, value) => {
    const val = Math.max(0, parseInt(value) || 0)
    setCart(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { cartons: 0, pieces: 0 }),
        [type]: val
      }
    }))
  }

  const filteredProducts = useMemo(() => products.filter(p => 
    p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [products, searchQuery])

  const cartSummary = useMemo(() => {
    let totalAmount = 0
    let totalItems = 0
    const items = []

    Object.keys(cart).forEach(pid => {
      const product = products.find(p => p._id === pid)
      if (product && (cart[pid].cartons > 0 || cart[pid].pieces > 0)) {
        const qtyInPieces = (cart[pid].cartons * (product.cartonConversion || 1)) + cart[pid].pieces
        const amount = qtyInPieces * (product.pricePerPiece || 0)
        
        totalAmount += amount
        totalItems += 1
        items.push({
          productId: pid,
          quantity: qtyInPieces
        })
      }
    })

    return { totalAmount, totalItems, items }
  }, [cart, products])

  const handleSubmit = async () => {
    if (cartSummary.items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        customerId: shopId,
        routeId: routeId,
        items: cartSummary.items,
        paymentType: paymentType,
        deliveryDate: new Date() // Defaulting to today/now
      }

      const response = await axios.post('/api/orders', payload)
      if (response.data.success) {
        toast.success('Order booked successfully')
        router.push('/orders/book-now')
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.error(error.response?.data?.message || 'Failed to book order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 30 }}>
      <HeaderBox>
        <IconButton color='inherit' onClick={() => router.back()}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h6' sx={{ color: 'inherit', fontWeight: 600 }}>
          Take Order
        </Typography>
        <Box sx={{ width: 40 }} />
      </HeaderBox>

      {/* Shop Info Card */}
      <Box sx={{ p: 6, bgcolor: 'background.paper', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
        <Stack direction='row' alignItems='center' spacing={4}>
          <Avatar sx={{ bgcolor: alpha('#00AEEF', 0.1), color: '#00AEEF', borderRadius: 2 }}>
            <Icon icon='mdi:storefront' />
          </Avatar>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>{shop?.shopName}</Typography>
            <Typography variant='caption' color='text.secondary'>{shop?.address}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Search and List */}
      <Box sx={{ p: 6 }}>
        <TextField
          fullWidth
          placeholder='Search products...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 6 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='mdi:magnify' />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />

        {filteredProducts.map((product) => (
          <ProductItem key={product._id}>
            <CardContent>
              <Grid container spacing={4} alignItems='center'>
                <Grid item xs>
                  <Typography sx={{ fontWeight: 600 }}>{product.productName}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {product.variant} • {product.size} • 1x{product.cartonConversion}
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 1, fontWeight: 700, color: 'primary.main' }}>
                    Rs {product.pricePerPiece} / Pc
                  </Typography>
                </Grid>
                <Grid item>
                  <Stack direction='row' spacing={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='caption' sx={{ display: 'block', mb: 1 }}>Carton</Typography>
                      <QtyInput 
                        value={cart[product._id]?.cartons || ''} 
                        onChange={(e) => handleQtyChange(product._id, 'cartons', e.target.value)}
                        type='number'
                      />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='caption' sx={{ display: 'block', mb: 1 }}>Pieces</Typography>
                      <QtyInput 
                        value={cart[product._id]?.pieces || ''} 
                        onChange={(e) => handleQtyChange(product._id, 'pieces', e.target.value)}
                        type='number'
                      />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </ProductItem>
        ))}
      </Box>

      {/* Summary Footer */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: { xs: 0, lg: '260px' }, // Offset if sidebar is open
          right: 0, 
          bgcolor: 'background.paper', 
          borderTop: theme => `1px solid ${theme.palette.divider}`,
          p: 6,
          boxShadow: theme => theme.shadows[10],
          zIndex: 10
        }}
      >
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 4 }}>
          <Box>
            <Typography variant='caption' color='text.secondary'>Total Items</Typography>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>{cartSummary.totalItems}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='caption' color='text.secondary'>Grand Total</Typography>
            <Typography variant='h5' sx={{ fontWeight: 800, color: 'primary.main' }}>
              Rs {cartSummary.totalAmount.toLocaleString()}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={6}>
            <ToggleButtonGroup
              fullWidth
              value={paymentType}
              exclusive
              onChange={(e, val) => val && setPaymentType(val)}
              size='small'
            >
              <ToggleButton value='CASH' sx={{ fontWeight: 700 }}>CASH</ToggleButton>
              <ToggleButton value='CREDIT' sx={{ fontWeight: 700 }}>CREDIT</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant='contained' 
              size='large' 
              onClick={handleSubmit} 
              disabled={submitting}
              sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
            >
              {submitting ? <CircularProgress size={20} /> : 'BOOK ORDER'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default CreateOrder
