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
import Chip from '@mui/material/Chip'
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
  alignItems: 'center'
}))

const ShopCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: '#00AEEF',
    backgroundColor: alpha('#00AEEF', 0.02)
  }
}))

const RouteDetail = () => {
  // ** Hooks
  const router = useRouter()
  const { id } = router.query

  // ** State
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchRoute = async () => {
      if (!id) return
      try {
        setLoading(true)
        // Since we don't have a get single route with customers populated by ID easily without admin rights maybe?
        // Let's try /api/routes/my-route and find the one with this ID
        const response = await axios.get('/api/routes/my-route')
        if (response.data.success) {
          const routes = Array.isArray(response.data.data) ? response.data.data : [response.data.data]
          const found = routes.find(r => r._id === id)
          setRoute(found)
        }
      } catch (error) {
        console.error('Failed to fetch route details:', error)
        toast.error('Failed to load route details')
      } finally {
        setLoading(false)
      }
    }

    fetchRoute()
  }, [id])

  const filteredShops = route?.customers?.filter(shop => 
    shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!route) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography>Route not found</Typography>
        <Button onClick={() => router.back()}>Go Back</Button>
      </Box>
    )
  }

  return (
    <Box>
      <HeaderBox>
        <IconButton color='inherit' onClick={() => router.back()} sx={{ mr: 2 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h6' sx={{ color: 'inherit', fontWeight: 600 }}>
          {route.name}
        </Typography>
      </HeaderBox>

      <Box sx={{ p: 6 }}>
        <TextField
          fullWidth
          placeholder='Search shops in this route...'
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

        <Typography variant='subtitle2' sx={{ mb: 4, fontWeight: 700, color: 'text.secondary', px: 2 }}>
          SHOPS ({filteredShops.length})
        </Typography>

        {filteredShops.map((shop) => (
          <ShopCard key={shop._id} onClick={() => router.push(`/orders/create?shopId=${shop._id}&routeId=${route._id}`)}>
            <CardContent sx={{ py: '16px !important' }}>
              <Grid container spacing={4} alignItems='center'>
                <Grid item>
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
                </Grid>
                <Grid item xs>
                  <Typography sx={{ fontWeight: 600 }}>{shop.shopName}</Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                    {shop.name} • {shop.mobileNumber || 'No contact'}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip 
                    label='Take Order' 
                    size='small' 
                    color='primary'
                    variant='outlined'
                    sx={{ borderRadius: 1.5, fontWeight: 600 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </ShopCard>
        ))}

        {filteredShops.length === 0 && (
          <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
            <Icon icon='mdi:store-off-outline' fontSize='3rem' />
            <Typography sx={{ mt: 2 }}>No shops found in this route</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default RouteDetail
