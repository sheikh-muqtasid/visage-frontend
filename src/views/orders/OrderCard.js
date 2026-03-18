import { Card, CardContent, Typography, Box, Grid, Chip, IconButton, Stack, Avatar } from '@mui/material'
import { styled, alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: '#00AEEF',
    boxShadow: `0 4px 12px ${alpha('#00AEEF', 0.1)}`
  }
}))

const OrderCard = ({ order }) => {
  const statusColors = {
    BOOKED: 'info',
    OUT_FOR_DELIVERY: 'warning',
    DELIVERED: 'success',
    CANCELLED: 'error'
  }

  const getStatusLabel = (status) => {
    if (status === 'OUT_FOR_DELIVERY') return 'DISPATCHED'
    return status
  }

  return (
    <StyledCard>
      <CardContent sx={{ p: '16px !important' }}>
        <Grid container spacing={4} alignItems='center'>
          <Grid item>
            <Avatar sx={{ bgcolor: alpha('#00AEEF', 0.1), color: '#00AEEF' }}>
              <Icon icon='mdi:file-document-outline' />
            </Avatar>
          </Grid>
          
          <Grid item xs>
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
              {order.orderNumber}
            </Typography>
            <Stack direction='row' spacing={4} alignItems='center'>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Icon icon='mdi:storefront-outline' fontSize='0.9rem' style={{ marginRight: 4, color: '#9e9e9e' }} />
                <Typography variant='body2' color='text.secondary'>
                  {order.customerId?.shopName || order.customerId?.name || 'Unknown Customer'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Icon icon='mdi:calendar-outline' fontSize='0.9rem' style={{ marginRight: 4, color: '#9e9e9e' }} />
                <Typography variant='body2' color='text.secondary'>
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item sx={{ textAlign: 'right' }}>
            <Typography variant='h6' sx={{ fontWeight: 700, color: '#00AEEF', mb: 1 }}>
              Rs {order.totalAmount?.toLocaleString() || 0}
            </Typography>
            <Chip 
              label={getStatusLabel(order.status)} 
              color={statusColors[order.status] || 'default'} 
              size='small'
              variant='light'
              sx={{ fontWeight: 600, height: 24 }}
            />
          </Grid>

          <Grid item>
            <IconButton color='secondary' size='small'>
              <Icon icon='mdi:chevron-right' />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  )
}

export default OrderCard
