import { useState, useEffect } from 'react'
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
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Fab from '@mui/material/Fab'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

// ** Custom Components
import AddStockForm from 'src/views/inventory/AddStockForm'
import VanLoadForm from 'src/views/inventory/VanLoadForm'

const HeaderWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 6),
  display: 'flex',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  zIndex: 10
}))

const ValueCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7367F0 0%, #9E95F5 100%)',
  color: theme.palette.common.white,
  borderRadius: 16,
  marginBottom: theme.spacing(6),
  boxShadow: '0 4px 20px 0 rgba(115, 103, 240, 0.4)'
}))

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[2],
    transform: 'translateY(-2px)'
  }
}))

const StockBadge = styled(Box)(({ theme, color }) => ({
  width: 44,
  height: 44,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha('#F44336', 0.1),
  color: '#F44336',
  marginRight: theme.spacing(4),
  '& .count': {
    fontSize: '0.85rem',
    fontWeight: 700,
    lineHeight: 1.2
  },
  '& .unit': {
    fontSize: '0.65rem',
    fontWeight: 600,
    opacity: 0.8
  }
}))

const InventoryManagement = () => {
  // ** Hooks
  const router = useRouter()

  // ** State
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState({}) // { productId: { quantity, cartons, value } }
  const [totalValue, setTotalValue] = useState(0)
  const [addStockOpen, setAddStockOpen] = useState(false)
  const [vanLoadOpen, setVanLoadOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const [warehousesRes, productsRes] = await Promise.all([
          axios.get('/api/warehouses'),
          axios.get('/api/products', { params: { limit: 100 } })
        ])

        if (warehousesRes.data.success) {
          const whs = warehousesRes.data.data?.warehouses || []
          setWarehouses(whs)
          if (whs.length > 0) {
            setSelectedWarehouse(whs[0]._id)
          }
        }

        if (productsRes.data.success) {
          setProducts(productsRes.data.data.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch initial inventory data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchStockData = async () => {
      if (!selectedWarehouse || products.length === 0) return

      try {
        // Since we can't change backend, we'll fetch ledger for this warehouse and aggregate
        // Alternatively, we could call /api/inventory/stock for each product, but ledger is more complete
        const ledgerRes = await axios.get('/api/inventory/ledger', {
          params: {
            locationType: 'WAREHOUSE',
            locationId: selectedWarehouse,
            limit: 1000 // Assume 1000 entries is enough for current stock calculation if we don't have a snapshot
          }
        })

        if (ledgerRes.data.success) {
          const ledgerEntries = ledgerRes.data.data.ledger || []
          const stockMap = {}
          let grandTotal = 0

          // Initialize with 0s
          products.forEach(p => {
            stockMap[p._id] = { quantity: 0, cartons: 0, value: 0 }
          })

          // Aggregate from ledger
          ledgerEntries.forEach(entry => {
            const pId = entry.productId?._id || entry.productId
            if (stockMap[pId]) {
              stockMap[pId].quantity += entry.quantity || 0
              stockMap[pId].cartons += entry.cartons || 0
            }
          })

          // Calculate monetary values
          products.forEach(p => {
            if (stockMap[p._id]) {
              stockMap[p._id].value = stockMap[p._id].quantity * (p.pricePerPiece || 0)
              grandTotal += stockMap[p._id].value
            }
          })

          setInventory(stockMap)
          setTotalValue(grandTotal)
        }
      } catch (error) {
        console.error('Failed to fetch stock levels:', error)
        toast.error('Failed to calculate stock levels')
      }
    }

    fetchStockData()
  }, [selectedWarehouse, products, refreshTrigger])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 24, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <HeaderWrapper>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h6' sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
          Inventory Management
        </Typography>
        <Box sx={{ width: 40 }} />
      </HeaderWrapper>

      <Box sx={{ p: 6 }}>
        {/* Warehouse Selection */}
        <TextField
          select
          fullWidth
          label='Select Warehouse'
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          sx={{ mb: 6 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='mdi:warehouse' />
              </InputAdornment>
            ),
            sx: { borderRadius: 3, bgcolor: 'background.paper' }
          }}
        >
          {Array.isArray(warehouses) && warehouses.map((wh) => (
            <MenuItem key={wh._id} value={wh._id}>
              {wh.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Total Stock Value */}
        <ValueCard>
          <CardContent sx={{ p: '24px !important', display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, mr: 4 }}>
              <Icon icon='mdi:cube-outline' />
            </Avatar>
            <Box>
              <Typography variant='caption' sx={{ opacity: 0.8, display: 'block' }}>
                Total Stock Value
              </Typography>
              <Typography variant='h4' sx={{ fontWeight: 700 }}>
                Rs {totalValue.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </ValueCard>

        {/* Product List */}
        {Array.isArray(products) && products.map((product) => {
          const stock = (inventory && inventory[product._id]) || { quantity: 0, cartons: 0, value: 0 }
          
          return (
            <ProductCard key={product._id}>
              <CardContent sx={{ p: '16px !important' }}>
                <Grid container alignItems='center' wrap='nowrap'>
                  <Grid item>
                    <Stack direction='row' spacing={1} sx={{ mr: 4 }}>
                      <StockBadge>
                        <span className='count'>{stock.cartons}</span>
                        <span className='unit'>C</span>
                      </StockBadge>
                      <StockBadge>
                        <span className='count'>{stock.quantity}</span>
                        <span className='unit'>P</span>
                      </StockBadge>
                    </Stack>
                  </Grid>
                  <Grid item sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {product.productName}
                    </Typography>
                    <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 0.5 }}>
                      <Typography 
                        variant='caption' 
                        sx={{ 
                          bgcolor: '#E0E0E0', 
                          px: 1.5, 
                          py: 0.2, 
                          borderRadius: 1, 
                          fontWeight: 600,
                          fontSize: '0.65rem'
                        }}
                      >
                        {product.variant}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
                        {product.size} • SKU: {product.sku}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item sx={{ textAlign: 'right' }}>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                      Value
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      Rs {stock.value.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </ProductCard>
          )
        })}

        {products.length === 0 && (
          <Box sx={{ py: 20, textAlign: 'center', opacity: 0.5 }}>
            <Icon icon='mdi:cube-off-outline' fontSize='3rem' />
            <Typography sx={{ mt: 2 }}>No products found</Typography>
          </Box>
        )}
      </Box>

      {/* Speed Dial / FABs */}
      <Box sx={{ position: 'fixed', bottom: 30, right: 30, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Fab
          variant='extended'
          size='medium'
          onClick={() => setVanLoadOpen(true)}
          sx={{ 
            bgcolor: '#E91E63', 
            color: 'white', 
            '&:hover': { bgcolor: '#D81B60' },
            textTransform: 'none',
            px: 6,
            boxShadow: '0 4px 10px rgba(233, 30, 99, 0.3)'
          }}
        >
          <Icon icon='mdi:truck-delivery-outline' sx={{ mr: 2 }} />
          Transfer
        </Fab>
        <Fab
          variant='extended'
          size='medium'
          onClick={() => setAddStockOpen(true)}
          sx={{ 
            bgcolor: '#00AEEF', 
            color: 'white', 
            '&:hover': { bgcolor: '#0096ce' },
            textTransform: 'none',
            px: 6,
            boxShadow: '0 4px 10px rgba(0, 174, 239, 0.3)'
          }}
        >
          <Icon icon='mdi:plus' sx={{ mr: 2 }} />
          Add Stock
        </Fab>
      </Box>

      {/* Add Stock Form Modal */}
      <AddStockForm 
        open={addStockOpen} 
        onClose={() => setAddStockOpen(false)} 
        onSuccess={handleRefresh}
      />

      {/* Van Load Form Modal */}
      <VanLoadForm
        open={vanLoadOpen}
        onClose={() => setVanLoadOpen(false)}
        onSuccess={handleRefresh}
      />
    </Box>
  )
}

import InputAdornment from '@mui/material/InputAdornment'

export default InventoryManagement
