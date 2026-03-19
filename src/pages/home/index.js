import { useEffect, useState, useMemo } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { styled, useTheme, alpha } from '@mui/material/styles'
import Avatar from '@mui/material/Avatar'
import NextLink from 'next/link'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** API Import
import axios from 'src/api/axiosInstance'
import { useAuth } from 'src/hooks/useAuth'

const HeaderWrapper = styled(Box)(({ theme }) => ({
  background: `linear-gradient(200deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
  padding: theme.spacing(8, 10),
  borderRadius: 24,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(8),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    filter: 'blur(40px)'
  }
}))

const PremiumCard = styled(Card)(({ theme, gradient }) => ({
  borderRadius: 24,
  border: 'none',
  background: gradient || theme.palette.background.paper,
  color: theme.palette.common.white,
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 24px -10px ${alpha(theme.palette.common.black, 0.3)}`
  }
}))

const IconWrapper = styled(Avatar)(({ theme }) => ({
  width: 50,
  height: 50,
  borderRadius: 14,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: theme.palette.common.white,
  marginBottom: theme.spacing(4)
}))

const Home = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalProducts: 0,
    todaysOrders: 0,
    todayDelivered: 0,
    cashCollected: 0,
    outstanding: 0,
    salesHistory: [10, 25, 15, 40, 30, 60, 45] // Mocked if not from API
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch Summary and Sales Chart in parallel
        const [summaryRes, chartRes] = await Promise.all([
          axios.get('/api/dashboard/summary'),
          axios.get('/api/dashboard/sales-chart')
        ])

        if (summaryRes.data.success) {
          const { stats } = summaryRes.data.data
          setData(prev => ({
            ...prev,
            totalProducts: stats.totalProducts || 0,
            todaysOrders: stats.todayOrders || 0,
            todayDelivered: stats.todayDeliveredOrders || 0,
            cashCollected: stats.cashCollectedToday || 0,
            outstanding: stats.uncollectedPartiallyToday || 0
          }))
        }

        if (chartRes.data.success) {
          const chartData = chartRes.data.data.map(item => item.totalSales)
          const labels = chartRes.data.data.map(item => item.label)

          setData(prev => ({
            ...prev,
            salesHistory: chartData,
            chartLabels: labels
          }))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const fullName = useMemo(() => user?.fullName ? `${user.fullName.first} ${user.fullName.last}` : 'User', [user])
  const role = useMemo(() => user?.role ? user.role.replace('_', ' ').toLowerCase() : 'admin', [user])

  const chartOptions = useMemo(() => ({
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    grid: { show: false },
    colors: [theme.palette.primary.main],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: data.chartLabels || [],
      labels: { show: true, style: { colors: theme.palette.text.disabled } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        show: true,
        style: { colors: theme.palette.text.disabled },
        formatter: (val) => `Rs ${val / 1000}K`
      }
    },
    tooltip: { enabled: true, theme: theme.palette.mode }
  }), [theme.palette.primary.main, theme.palette.text.disabled, theme.palette.mode, data.chartLabels])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header Banner */}
      <HeaderWrapper>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant='h6' sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}>
            Welcome back, {fullName}! 👋
          </Typography>
          <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            Visage Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ px: 3, py: 1, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {role} account
              </Typography>
            </Box>
            <Typography variant='caption' sx={{ opacity: 0.8 }}>
              Real-time monitoring enabled
            </Typography>
          </Box>
        </Box>
      </HeaderWrapper>

      <Grid container spacing={6}>
        {/* Row 1: Key Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Box component={NextLink} href='/inventory' sx={{ textDecoration: 'none' }}>
            <PremiumCard gradient='linear-gradient(135deg, #7367F0 0%, #CE9FFC 100%)'>
              <CardContent>
                <IconWrapper><Icon icon='mdi:package-variant' /></IconWrapper>
                <Typography variant='h4' sx={{ fontWeight: 700 }}>{data.totalProducts}</Typography>
                <Typography variant='body2' sx={{ opacity: 0.8 }}>Total Products</Typography>
              </CardContent>
            </PremiumCard>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box component={NextLink} href='/orders' sx={{ textDecoration: 'none' }}>
            <PremiumCard gradient='linear-gradient(135deg, #28C76F 0%, #81FBB8 100%)'>
              <CardContent>
                <IconWrapper><Icon icon='mdi:cart-outline' /></IconWrapper>
                <Typography variant='h4' sx={{ fontWeight: 700 }}>{data.todaysOrders}</Typography>
                <Typography variant='body2' sx={{ opacity: 0.8 }}>Today's Orders</Typography>
              </CardContent>
            </PremiumCard>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box component={NextLink} href='/orders?status=DELIVERED' sx={{ textDecoration: 'none' }}>
            <PremiumCard gradient='linear-gradient(135deg, #00AEEF 0%, #B3E5FC 100%)'>
              <CardContent>
                <IconWrapper><Icon icon='mdi:truck-delivery-outline' /></IconWrapper>
                <Typography variant='h4' sx={{ fontWeight: 700 }}>{data.todayDelivered}</Typography>
                <Typography variant='body2' sx={{ opacity: 0.8 }}>Today Delivered</Typography>
              </CardContent>
            </PremiumCard>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box component={NextLink} href='/orders/book-now' sx={{ textDecoration: 'none' }}>
            <PremiumCard gradient='linear-gradient(135deg, #FF9F43 0%, #FFCC80 100%)'>
              <CardContent>
                <IconWrapper><Icon icon='mdi:plus-circle-outline' /></IconWrapper>
                <Typography variant='h4' sx={{ fontWeight: 700 }}>Book Now</Typography>
                <Typography variant='body2' sx={{ opacity: 0.8 }}>Take New Order</Typography>
              </CardContent>
            </PremiumCard>
          </Box>
        </Grid>

        {/* Row 2: Financials & Chart */}
        <Grid item xs={12} md={4}>
          <Stack spacing={6}>
            <PremiumCard gradient='linear-gradient(135deg, #EA5455 0%, #FEB692 100%)'>
              <CardContent sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant='body2' sx={{ opacity: 0.9, mb: 1 }}>Cash Collected</Typography>
                    <Typography variant='h4' sx={{ fontWeight: 800 }}>Rs {data.cashCollected >= 1000 ? (data.cashCollected / 1000).toFixed(1) : data.cashCollected}K</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Icon icon='mdi:cash-multiple' fontSize='2rem' />
                  </Avatar>
                </Box>
              </CardContent>
            </PremiumCard>

            <PremiumCard gradient='linear-gradient(135deg, #959090ff 0%, #b3afafff 100%)'>
              <CardContent sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant='body2' sx={{ opacity: 0.9, mb: 1 }}>Outstanding (Est)</Typography>
                    <Typography variant='h4' sx={{ fontWeight: 800 }}>Rs {data.outstanding >= 1000 ? (data.outstanding / 1000).toFixed(1) : data.outstanding}K</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Icon icon='mdi:alert-circle-outline' fontSize='2rem' />
                  </Avatar>
                </Box>
              </CardContent>
            </PremiumCard>
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 700 }}>Daily Sales Trend</Typography>
                  <Typography variant='caption' color='text.secondary'>Last 7 days performance</Typography>
                </Box>
                <Typography variant='body2' color='primary' sx={{ fontWeight: 600, cursor: 'pointer' }}>View Report</Typography>
              </Box>
              <ReactApexcharts
                type='area'
                height={200}
                options={chartOptions}
                series={[{ name: 'Sales', data: data.salesHistory }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

Home.guestGuard = false
Home.authGuard = true

export default Home
