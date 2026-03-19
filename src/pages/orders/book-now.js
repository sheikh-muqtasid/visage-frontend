import { useState, useEffect, useMemo } from 'react'
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
import { styled, alpha, useTheme } from '@mui/material/styles'
import NextLink from 'next/link'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'
import { useAuth } from 'src/hooks/useAuth'

const HeaderWrapper = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #2196F3 0%, #E91E63 100%)`,
  padding: theme.spacing(6, 4, 20),
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden'
}))

const GlassCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || theme.palette.background.paper,
  color: theme.palette.common.white,
  borderRadius: 16,
  boxShadow: 'none',
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
}))

const ActionLinkCard = styled(Card)(({ theme }) => ({
  background: '#3F51B5',
  color: theme.palette.common.white,
  borderRadius: 16,
  boxShadow: 'none',
  cursor: 'pointer'
}))

const RouteCardItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  boxShadow: 'none',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper
}))

const BookNowPage = () => {
  // ** Hooks
  const { user } = useAuth()
  const router = useRouter()
  const theme = useTheme()

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

  const fullName = useMemo(() => user?.fullName?.first ? `${user.fullName.first} ${user.fullName.last}` : (user?.fullName || user?.email || 'User'), [user])

  const filteredShops = useMemo(() => shops.filter(shop =>
    shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [shops, searchQuery])

  if (loading && !routes.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 12, bgcolor: 'customColors.bodyBg', minHeight: '100vh' }}>
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

        <Box sx={{ mt: 2 }}>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Typography variant='body2' sx={{ color: 'inherit' }}>
              Good Morning
            </Typography>
            <Icon icon='mdi:hand-wave' fontSize='1.2rem' sx={{ color: '#FFD600' }} />
          </Stack>
          <Typography variant='h4' sx={{ color: 'inherit', fontWeight: 800, mt: 0.5 }} noWrap>
            {fullName}
          </Typography>
          <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.8, mt: 1, mb: 10, display: 'block' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Typography>
        </Box>
      </HeaderWrapper>

      <Box sx={{ p: 6, mt: -2 }}>
        <Grid container spacing={5}>
          {/* Summary Cards */}
          <Grid item xs={6}>
            <GlassCard gradient='linear-gradient(135deg, #EC407A 0%, #D81B60 100%)'>
              <CardContent sx={{ p: '12px 16px !important' }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Icon icon='mdi:file-document-outline' fontSize='1rem' />
                </Box>
                <Typography variant='h5' sx={{ color: 'inherit', fontWeight: 700 }}>
                  {stats.todaysOrders}
                </Typography>
                <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.9, mt: 0.2, fontWeight: 500, display: 'block' }}>
                  Today's Orders
                </Typography>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={6}>
            <GlassCard gradient='linear-gradient(135deg, #26A69A 0%, #00897B 100%)'>
              <CardContent sx={{ p: '12px 16px !important' }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Icon icon='mdi:check-circle-outline' fontSize='1rem' />
                </Box>
                <Typography variant='h5' sx={{ color: 'inherit', fontWeight: 700 }}>
                  {stats.todayDelivered}
                </Typography>
                <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.9, mt: 0.2, fontWeight: 500, display: 'block' }}>
                  Delivered
                </Typography>
              </CardContent>
            </GlassCard>
          </Grid>

          {/* My Orders Link Card */}
          <Grid item xs={12}>
            <ActionLinkCard onClick={() => router.push('/orders')}>
              <CardContent sx={{ py: '12px !important', px: '16px !important' }}>
                <Stack direction='row' alignItems='center' spacing={3}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon='mdi:file-document-multiple-outline' fontSize='1.2rem' />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='subtitle2' sx={{ color: 'inherit', fontWeight: 700 }}>My Orders</Typography>
                    <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.8, fontWeight: 400, display: 'block' }}>
                      View all your booked orders
                    </Typography>
                  </Box>
                  <IconButton size='small' color='inherit'>
                    <Icon icon='mdi:chevron-right' fontSize='1.2rem' />
                  </IconButton>
                </Stack>
              </CardContent>
            </ActionLinkCard>
          </Grid>

          {/* Routes Section */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                Select Today's Route
              </Typography>
              <Typography variant='caption' sx={{ fontWeight: 700, color: 'primary.main' }}>
                {routes.length} Found
              </Typography>
            </Box>

            {/* All Assigned Shops Item */}
            <RouteCardItem onClick={() => router.push('/orders/all-shops')}>
              <CardContent sx={{ p: '12px 16px !important' }}>
                <Stack direction='row' alignItems='center' spacing={4}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha('#FFA000', 0.1), color: '#FFA000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon='mdi:store-outline' fontSize='1.5rem' />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>All Assigned Shops</Typography>
                    <Typography variant='caption' color='text.secondary'>{shops.length} Shops</Typography>
                  </Box>
                  <Icon icon='mdi:chevron-right' color={theme.palette.text.disabled} />
                </Stack>
              </CardContent>
            </RouteCardItem>

            <Grid container spacing={1}>
              {routes.map((route) => (
                <Grid item xs={12} key={route._id}>
                  <RouteCardItem onClick={() => router.push(`/orders/route/${route._id}`)}>
                    <CardContent sx={{ p: '12px 16px !important' }}>
                      <Stack direction='row' alignItems='center' spacing={4}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha('#4FC3F7', 0.1), color: '#4FC3F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon icon='mdi:map-marker-path' fontSize='1.5rem' />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{route.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {route.city} • {route.customers?.length || 0} Shops
                          </Typography>
                        </Box>
                        <Icon icon='mdi:chevron-right' color={theme.palette.text.disabled} />
                      </Stack>
                    </CardContent>
                  </RouteCardItem>
                </Grid>
              ))}
            </Grid>

            {routes.length === 0 && (
              <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                <Typography>No assigned routes found</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default BookNowPage
