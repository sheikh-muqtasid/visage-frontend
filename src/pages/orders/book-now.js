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
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { styled, alpha } from '@mui/material/styles'
import NextLink from 'next/link'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'
import { useAuth } from 'src/hooks/useAuth'

const HeaderWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2196F3 0%, #E91E63 100%)', // Adjusted to match screen's vibrant look
  padding: theme.spacing(6),
  color: theme.palette.common.white,
  position: 'relative',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0
}))

const SummaryCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient,
  color: theme.palette.common.white,
  borderRadius: 16,
  boxShadow: 'none',
  height: '100%',
  '& .MuiCardContent-root': {
    padding: theme.spacing(5)
  }
}))

const LinkCard = styled(Card)(({ theme }) => ({
  background: '#3F51B5',
  color: theme.palette.common.white,
  borderRadius: 16,
  boxShadow: 'none',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: '#303F9F'
  }
}))

const RouteItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: '#00AEEF',
    backgroundColor: alpha('#00AEEF', 0.02)
  }
}))

const BookNowPage = () => {
  // ** Hooks
  const { user } = useAuth()
  const router = useRouter()

  // ** State
  const [loading, setLoading] = useState(true)
  const [routes, setRoutes] = useState([])
  const [shops, setShops] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    todaysOrders: 0,
    todayDelivered: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [routesRes, summaryRes] = await Promise.all([
          axios.get('/api/routes/my-route'),
          axios.get('/api/dashboard/summary')
        ])

        if (routesRes.data.success) {
          const rawRoutes = Array.isArray(routesRes.data.data) ? routesRes.data.data : (routesRes.data.data ? [routesRes.data.data] : [])
          setRoutes(rawRoutes)
          
          // Flatten shops with their routeId
          const allShops = []
          rawRoutes.forEach(route => {
            if (route.customers) {
              route.customers.forEach(shop => {
                allShops.push({
                  ...shop,
                  routeId: route._id
                })
              })
            }
          })
          setShops(allShops)
        }

        if (summaryRes.data.success) {
          setStats({
            todaysOrders: summaryRes.data.data.stats?.todayOrders || 0,
            todayDelivered: summaryRes.data.data.stats?.todayDeliveredOrders || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch booker dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fullName = user?.fullName?.first ? `${user.fullName.first} ${user.fullName.last}` : (user?.fullName || user?.email || 'User')

  const filteredShops = shops.filter(shop => 
    shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && !routes.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <HeaderWrapper>
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 4 }}>
          <IconButton color='inherit' onClick={() => router.push('/home')}>
            <Icon icon='mdi:arrow-left' />
          </IconButton>
          <Stack direction='row' spacing={2}>
            <IconButton color='inherit'>
              <Icon icon='mdi:bell-outline' />
            </IconButton>
            <IconButton color='inherit'>
              <Icon icon='mdi:cog-outline' />
            </IconButton>
          </Stack>
        </Stack>

        <Typography variant='h6' sx={{ color: 'inherit', opacity: 0.9, fontWeight: 500 }}>
          Good Morning 👋
        </Typography>
        <Typography variant='h4' sx={{ color: 'inherit', fontWeight: 700, mt: 1 }}>
          {fullName}
        </Typography>
      </HeaderWrapper>

      <Box sx={{ p: 6, mt: -4 }}>
        <Grid container spacing={4}>
          {/* Summary Cards */}
          <Grid item xs={6}>
            <SummaryCard gradient='linear-gradient(135deg, #FF4081 0%, #E91E63 100%)'>
              <CardContent>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 3, width: 32, height: 32 }}>
                  <Icon icon='mdi:file-document-outline' fontSize='1.2rem' />
                </Avatar>
                <Typography variant='h4' sx={{ color: 'inherit', fontWeight: 700 }}>
                  {stats.todaysOrders}
                </Typography>
                <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.8 }}>
                  Today's Orders
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
          <Grid item xs={6}>
            <SummaryCard gradient='linear-gradient(135deg, #00C853 0%, #2E7D32 100%)'>
              <CardContent>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 3, width: 32, height: 32 }}>
                  <Icon icon='mdi:check-circle-outline' fontSize='1.2rem' />
                </Avatar>
                <Typography variant='h4' sx={{ color: 'inherit', fontWeight: 700 }}>
                  {stats.todayDelivered}
                </Typography>
                <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.8 }}>
                  Delivered
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>

          {/* My Orders Link Card */}
          <Grid item xs={12}>
            <LinkCard onClick={() => router.push('/orders')}>
              <CardContent sx={{ py: '12px !important' }}>
                <Stack direction='row' alignItems='center' spacing={4}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 44, height: 44 }}>
                    <Icon icon='mdi:file-document-multiple-outline' />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ color: 'inherit', fontWeight: 600 }}>My Orders</Typography>
                    <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.7 }}>
                      View all your booked orders
                    </Typography>
                  </Box>
                  <Icon icon='mdi:arrow-right-circle' />
                </Stack>
              </CardContent>
            </LinkCard>
          </Grid>

          {/* Shops Section */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 4 }}>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>All Assigned Shops</Typography>
              <Typography variant='caption' color='primary' sx={{ fontWeight: 600 }}>
                {filteredShops.length} Found
              </Typography>
            </Stack>

            <TextField
              fullWidth
              placeholder='Search assigned shops...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='mdi:magnify' />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: 'background.paper' }
              }}
            />

            {filteredShops.map((shop) => (
              <RouteItem key={shop._id} onClick={() => router.push(`/orders/create?shopId=${shop._id}&routeId=${shop.routeId}`)}>
                <CardContent sx={{ py: '16px !important' }}>
                  <Stack direction='row' alignItems='center' spacing={4}>
                    <Avatar 
                      sx={{ 
                        width: 44, 
                        height: 44, 
                        bgcolor: alpha('#00AEEF', 0.1),
                        color: '#00AEEF',
                        borderRadius: 2,
                        fontWeight: 600
                      }}
                    >
                      {(shop.shopName || shop.name)?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{shop.shopName}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {shop.name} • {shop.mobileNumber || 'No contact'}
                      </Typography>
                    </Box>
                    <Icon icon='mdi:chevron-right' color='#bdbdbd' />
                  </Stack>
                </CardContent>
              </RouteItem>
            ))}

            {filteredShops.length === 0 && (
              <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
                <Icon icon='mdi:store-off-outline' fontSize='3rem' />
                <Typography sx={{ mt: 2 }}>No assigned shops found for you today</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default BookNowPage
