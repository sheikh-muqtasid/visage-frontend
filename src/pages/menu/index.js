import { Grid, Card, Typography, Box, Avatar, Link as MuiLink } from '@mui/material'
import { styled, alpha } from '@mui/material/styles'
import NextLink from 'next/link'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const MenuWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100%'
}))

const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(10),
  fontWeight: 600,
  fontSize: '2rem',
  color: theme.palette.text.primary,
  textAlign: 'center',
  letterSpacing: '0.5px'
}))

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.shorter
  }),
  borderRadius: theme.shape.borderRadius * 3,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
    borderColor: 'transparent'
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(8, 4),
  height: '100%',
  textAlign: 'center'
}))

const IconAvatar = styled(Avatar)(({ theme, iconcolor }) => ({
  width: 64,
  height: 64,
  marginBottom: theme.spacing(5),
  backgroundColor: alpha(iconcolor || theme.palette.primary.main, 0.12),
  color: iconcolor || theme.palette.primary.main,
  fontSize: '2rem',
  '& i, & svg': {
    fontSize: '2rem'
  }
}))

const menuItems = [
  {
    title: 'Products',
    subtitle: 'Catalog & Pricing',
    icon: 'mdi:package-variant-closed',
    color: '#2196F3',
    path: '/products'
  },
  {
    title: 'Routes',
    subtitle: 'Logistics',
    icon: 'mdi:map-marker-path',
    color: '#4CAF50',
    path: '/routes'
  },
  {
    title: 'Shops',
    subtitle: 'Customers',
    icon: 'mdi:storefront-outline',
    color: '#FF9800',
    path: '/customers'
  },
  {
    title: 'Inventory',
    subtitle: 'Stock Levels',
    icon: 'mdi:cube-send',
    color: '#673AB7',
    path: '/inventory'
  },
  {
    title: 'Warehouses',
    subtitle: 'Depots',
    icon: 'mdi:warehouse',
    color: '#9C27B0',
    path: '/warehouses'
  },
  {
    title: 'Orders',
    subtitle: 'Dispatch',
    icon: 'mdi:file-document-outline',
    color: '#F44336',
    path: '/orders'
  },
  {
    title: 'Users',
    subtitle: 'Access Control',
    icon: 'mdi:account-group-outline',
    color: '#00BCD4',
    path: '/users'
  }
]

const MenuPage = () => {
  return (
    <MenuWrapper>
      <PageTitle variant='h4' component='h4'>
        Management Menu
      </PageTitle>
      <Grid container spacing={8} justifyContent='center' sx={{ maxWidth: 1400 }}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={1.7} key={index}>
            <MuiLink
              component={NextLink}
              href={item.path}
              sx={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
            >
              <StyledCard>
                <IconAvatar iconcolor={item.color}>
                  <Icon icon={item.icon} />
                </IconAvatar>
                <Typography variant='h6' sx={{ mb: 1.5, fontWeight: 700, lineHeight: 1.2 }}>
                  {item.title}
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {item.subtitle}
                </Typography>
              </StyledCard>
            </MuiLink>
          </Grid>
        ))}
      </Grid>
    </MenuWrapper>
  )
}

export default MenuPage


