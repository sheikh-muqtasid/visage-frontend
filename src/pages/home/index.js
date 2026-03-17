import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Avatar from '@mui/material/Avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** API Import
import axios from 'src/api/axiosInstance'
import { useAuth } from 'src/hooks/useAuth'

const HeaderWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196F3 0%, #AB47BC 100%)',
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(6)
}))

const StatsCard = styled(Card)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor || theme.palette.background.paper,
  color: theme.palette.common.white,
  height: '100%',
  '& .MuiCardContent-root': {
    padding: theme.spacing(4)
  }
}))

const Home = () => {
  const { user } = useAuth()
  const [data, setData] = useState({
    totalProducts: 15,
    todaysOrders: 0,
    todayDelivered: 0,
    cashCollected: 0,
    outstanding: 0
  })

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('/api/dashboard/summary')
        if (response.data.success) {
          setData(prev => ({
            ...prev,
            ...response.data.data
          }))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error)
      }
    }
    fetchSummary()
  }, [])

  const fullName = user?.fullName ? `${user.fullName.first} ${user.fullName.last}` : 'User'
  const role = user?.role ? `(${user.role.replace('_', ' ')})` : ''

  return (
    <Box>
      <HeaderWrapper>
        <Typography variant='h6' sx={{ color: 'inherit' }}>Dashboard</Typography>
        <Typography variant='h4' sx={{ color: 'inherit', fontWeight: 600 }}>
          {fullName} {role}
        </Typography>
      </HeaderWrapper>

      <Grid container spacing={6}>
        {/* Total Products */}
        <Grid item xs={12} md={6}>
          <StatsCard bgcolor='#7E57C2'>
            <CardContent>
              <Avatar sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Icon icon='mdi:package-variant' />
              </Avatar>
              <Typography variant='h4' sx={{ mb: 1, color: 'inherit' }}>{data.totalProducts}</Typography>
              <Typography sx={{ color: 'inherit', opacity: 0.8 }}>Total Products</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        {/* Today's Orders */}
        <Grid item xs={12} md={6}>
          <StatsCard bgcolor='#26C6DA'>
            <CardContent>
              <Avatar sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Icon icon='mdi:file-document-edit' />
              </Avatar>
              <Typography variant='h4' sx={{ mb: 1, color: 'inherit' }}>{data.todaysOrders}</Typography>
              <Typography sx={{ color: 'inherit', opacity: 0.8 }}>Today's Orders</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        {/* Today Delivered */}
        <Grid item xs={12} md={6}>
          <StatsCard bgcolor='#00BFA5'>
            <CardContent>
              <Avatar sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Icon icon='mdi:check-circle' />
              </Avatar>
              <Typography variant='h4' sx={{ mb: 1, color: 'inherit' }}>{data.todayDelivered}</Typography>
              <Typography sx={{ color: 'inherit', opacity: 0.8 }}>Today Delivered</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        {/* Book Now */}
        <Grid item xs={12} md={6}>
          <StatsCard bgcolor='#5C6BC0'>
            <CardContent>
              <Avatar sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Icon icon='mdi:briefcase-plus' />
              </Avatar>
              <Typography variant='h4' sx={{ mb: 1, color: 'inherit' }}>Book Now</Typography>
              <Typography sx={{ color: 'inherit', opacity: 0.8 }}>Take Order</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        {/* Cash Collected */}
        <Grid item xs={12} md={6}>
          <StatsCard bgcolor='#E67E22'>
            <CardContent>
              <Avatar sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Icon icon='mdi:cash-multiple' />
              </Avatar>
              <Typography variant='h4' sx={{ mb: 1, color: 'inherit' }}>Rs {data.cashCollected}K</Typography>
              <Typography sx={{ color: 'inherit', opacity: 0.8 }}>Today Cash Collected</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        {/* Outstanding */}
        <Grid item xs={12} md={6}>
          <StatsCard bgcolor='#E74C3C'>
            <CardContent>
              <Avatar sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Icon icon='mdi:alert-circle' />
              </Avatar>
              <Typography variant='h4' sx={{ mb: 1, color: 'inherit' }}>Rs {data.outstanding}K</Typography>
              <Typography sx={{ color: 'inherit', opacity: 0.8 }}>Outstanding (Est)</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        {/* Daily Sales Chart Placeholder */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 4 }}>Daily Sales (7 Days)</Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'customColors.bodyBg', borderRadius: 1 }}>
                <Typography variant='body2' sx={{ color: 'text.disabled' }}>Sales Chart Visualization</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Home
