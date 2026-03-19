import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import { styled, alpha } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

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

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.main
  }
}))

const IconBox = styled(Box)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha('#00AEEF', 0.1),
  color: '#00AEEF',
  marginRight: theme.spacing(4)
}))

const StockChip = styled(Chip)(({ theme }) => ({
  height: 28,
  fontSize: '0.75rem',
  fontWeight: 600,
  borderRadius: 6,
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
  '& .MuiChip-icon': {
    color: 'inherit',
    marginLeft: 4
  }
}))

const WarehouseDetails = () => {
  // ** Hooks
  const router = useRouter()
  const { id } = router.query

  // ** State
  const [loading, setLoading] = useState(true)
  const [warehouse, setWarehouse] = useState(null)
  const [products, setProducts] = useState([])

  const fetchData = async () => {
    if (!id) return
    try {
      setLoading(true)
      
      // Fetch warehouse details
      const whRes = await axios.get(`/api/warehouses/${id}`)
      if (whRes.data.success) {
        setWarehouse(whRes.data.data)
      }

      // Fetch warehouse products/stock
      const stockRes = await axios.get(`/api/inventory/warehouse-stock/${id}`)
      if (stockRes.data.success) {
        setProducts(stockRes.data.data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch warehouse data:', error)
      toast.error('Failed to load warehouse data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  if (!id && !loading) return null

  return (
    <Box sx={{ pb: 10, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <HeaderWrapper>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h6' sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
          {warehouse?.name || 'Warehouse Details'}
        </Typography>
        <Box sx={{ width: 40 }} />
      </HeaderWrapper>

      <Box sx={{ p: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.length > 0 ? (
              products.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <ProductCard>
                    <CardContent sx={{ p: '16px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconBox>
                          <Icon icon='mdi:package-variant-closed' fontSize='1.5rem' />
                        </IconBox>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.2 }}>
                            {item.productName}
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {item.variant} • {item.size}
                          </Typography>
                        </Box>
                        <StockChip 
                          icon={<Icon icon='mdi:alert-circle-outline' fontSize='1rem' />}
                          label={`${item.totalCartons || 0} C / ${item.currentStock || 0} Pieces`}
                          sx={{
                            backgroundColor: (item.currentStock > 0) ? alpha('#28C76F', 0.1) : alpha('#EA5455', 0.1),
                            color: (item.currentStock > 0) ? '#28C76F' : '#EA5455',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </ProductCard>
                </Grid>
              ))
            ) : (
              <Box sx={{ width: '100%', py: 20, textAlign: 'center', opacity: 0.5 }}>
                <Icon icon='mdi:package-variant-closed' fontSize='3rem' />
                <Typography sx={{ mt: 2 }}>No products found in this warehouse</Typography>
              </Box>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default WarehouseDetails
