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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'
import { useAuth } from 'src/hooks/useAuth'

const HeaderWrapper = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #2196F3 0%, #E91E63 100%)`,
  padding: theme.spacing(8, 6, 18),
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden'
}))

const ShopCardItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  boxShadow: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.25)}`
  }
}))

const RouteShopsPage = () => {
  // ** Hooks
  const router = useRouter()
  const { id } = router.query
  const theme = useTheme()

  // ** State
  const [loading, setLoading] = useState(true)
  const [routeData, setRouteData] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const res = await axios.get('/api/routes/my-route')

        if (res.data.success) {
          const rawRoutes = Array.isArray(res.data.data) ? res.data.data : (res.data.data ? [res.data.data] : [])
          const foundRoute = rawRoutes.find(r => r._id === id)
          
          if (foundRoute) {
            setRouteData(foundRoute)
          } else {
            toast.error('Route not found')
            router.push('/orders/book-now')
          }
        }
      } catch (error) {
        console.error('Failed to fetch route shops:', error)
        toast.error('Failed to load shops')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const filteredShops = useMemo(() => {
    if (!routeData?.customers) return []
    
    return routeData.customers.filter(shop =>
      shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [routeData, searchQuery])

  if (loading && !routeData) {
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
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 6 }}>
          <IconButton color='inherit' onClick={() => router.back()} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
            <Icon icon='mdi:arrow-left' />
          </IconButton>
          <Typography variant='h6' sx={{ color: 'inherit', fontWeight: 700 }}>
            Route Detail
          </Typography>
          <Box sx={{ width: 40 }} />
        </Stack>
        
        <Box>
          <Typography variant='caption' sx={{ color: 'inherit', opacity: 0.8, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase' }}>
            {routeData?.city} Area
          </Typography>
          <Typography variant='h3' sx={{ color: 'inherit', fontWeight: 900, mt: 1, letterSpacing: '-1px' }}>
            {routeData?.name || 'Loading...'}
          </Typography>
        </Box>
      </HeaderWrapper>

      <Box sx={{ p: 6, mt: -10 }}>
        <TextField
          fullWidth
          placeholder='Filter shops in this route...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 6 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='mdi:magnify' color={theme.palette.primary.main} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 6,
              bgcolor: 'background.paper',
              height: 56,
              fontSize: '1rem',
              boxShadow: '0 8px 20px -10px rgba(0,0,0,0.15)',
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              '& fieldset': { border: 'none' }
            }
          }}
        />

        <Grid container spacing={4}>
          {filteredShops.map((shop) => (
            <Grid item xs={12} key={shop._id}>
              <ShopCardItem onClick={() => router.push(`/orders/create?shopId=${shop._id}&routeId=${id}`)}>
                <CardContent sx={{ p: '16px !important' }}>
                  <Stack direction='row' alignItems='center' spacing={4}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        borderRadius: 5,
                        fontWeight: 900,
                        fontSize: '1.4rem'
                      }}
                    >
                      {(shop.shopName || shop.name)?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: '-0.3px', mb: 0.5 }}>
                        {shop.shopName}
                      </Typography>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Icon icon='mdi:account-circle-outline' fontSize='0.9rem' color={theme.palette.text.secondary} />
                        <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                          {shop.name}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.divider, 0.1) }}>
                      <Icon icon='mdi:chevron-right' />
                    </Box>
                  </Stack>
                </CardContent>
              </ShopCardItem>
            </Grid>
          ))}
        </Grid>

        {filteredShops.length === 0 && (
          <Box sx={{ py: 20, textAlign: 'center', opacity: 0.5 }}>
            <Icon icon='mdi:store-off-outline' fontSize='3rem' />
            <Typography sx={{ mt: 2 }}>No shops found in this route</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default RouteShopsPage
