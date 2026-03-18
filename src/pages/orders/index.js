import { useState, useEffect, useCallback } from 'react'
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
import OrderCard from 'src/views/orders/OrderCard'

const HeaderBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#00AEEF',
  color: theme.palette.common.white,
  padding: theme.spacing(4, 6),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}))

const FilterChip = styled(Chip)(({ theme, active }) => ({
  borderRadius: 8,
  height: 32,
  fontWeight: 600,
  backgroundColor: active ? '#00AEEF' : theme.palette.background.paper,
  color: active ? theme.palette.common.white : theme.palette.text.secondary,
  border: active ? 'none' : `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: active ? '#0096ce' : theme.palette.action.hover
  },
  '& .MuiChip-label': {
    padding: theme.spacing(0, 4)
  }
}))

const OrderManagement = () => {
  // ** Hooks
  const router = useRouter()
  const { status: queryStatus } = router.query

  // ** State
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(queryStatus || 'ALL')
  const [counts, setCounts] = useState({
    ALL: 0,
    BOOKED: 0,
    DISPATCHED: 0,
    DELIVERED: 0,
    CANCELLED: 0
  })

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = status === 'ALL' ? {} : { status: status === 'DISPATCHED' ? 'OUT_FOR_DELIVERY' : status }
      const response = await axios.get('/api/orders', { params })
      
      if (response.data.success) {
        setOrders(response.data.data.orders || [])
        
        // Update count for the active status
        setCounts(prev => ({
          ...prev,
          [status]: response.data.data.total || 0
        }))
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [status])

  // Initial fetch for all counts
  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        const statuses = ['ALL', 'BOOKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']
        const promises = statuses.map(s => {
          const params = s === 'ALL' ? {} : { status: s === 'DISPATCHED' ? 'OUT_FOR_DELIVERY' : s }
          return axios.get('/api/orders', { params: { ...params, limit: 1 } })
        })
        
        const results = await Promise.all(promises)
        const newCounts = {}
        statuses.forEach((s, index) => {
          newCounts[s] = results[index].data.data?.total || 0
        })
        setCounts(newCounts)
      } catch (error) {
        console.error('Failed to fetch counts:', error)
      }
    }
    
    fetchAllCounts()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (queryStatus && ['ALL', 'BOOKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].includes(queryStatus)) {
      setStatus(queryStatus)
    }
  }, [queryStatus])

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    router.push({ pathname: router.pathname, query: { status: newStatus } }, undefined, { shallow: true })
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <HeaderBox>
        <IconButton color='inherit' onClick={() => window.history.back()}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h6' sx={{ color: 'inherit', fontWeight: 600 }}>
          Order Management
        </Typography>
        <Stack direction='row' spacing={2}>
          <IconButton color='inherit'>
            <Icon icon='mdi:file-download-outline' />
          </IconButton>
          <IconButton color='inherit' onClick={fetchOrders}>
            <Icon icon='mdi:refresh' />
          </IconButton>
        </Stack>
      </HeaderBox>

      {/* Filter Bar */}
      <Box sx={{ p: 4, bgcolor: 'background.paper', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
        <Stack direction='row' spacing={2} justifyContent='center' sx={{ overflowX: 'auto', pb: 1 }}>
          {['ALL', 'BOOKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((item) => (
            <FilterChip
              key={item}
              label={`${item} (${counts[item]})`}
              active={status === item}
              onClick={() => handleStatusChange(item)}
            />
          ))}
        </Stack>
      </Box>

      {/* List Content */}
      <Box sx={{ p: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 20 }}>
            <CircularProgress />
          </Box>
        ) : orders.length > 0 ? (
          <Grid container spacing={4}>
            {orders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order._id}>
                <OrderCard order={order} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack alignItems='center' justifyContent='center' sx={{ py: 20, opacity: 0.5 }}>
            <Icon icon='mdi:file-document-outline' fontSize='5rem' />
            <Typography variant='h6' sx={{ mt: 4 }}>
              No orders found
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default OrderManagement
