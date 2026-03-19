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
import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

// ** Custom Components
import WarehouseForm from 'src/views/warehouses/WarehouseForm'

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

const WarehouseCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[3],
    borderColor: 'transparent'
  }
}))

const IconBox = styled(Box)(({ theme }) => ({
  width: 50,
  height: 50,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha('#00AEEF', 0.1),
  color: '#00AEEF',
  marginRight: theme.spacing(4)
}))

const WarehousesPage = () => {
  // ** Hooks
  const router = useRouter()

  // ** State
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  
  // ** Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuId, setMenuId] = useState(null)
  const openMenu = Boolean(anchorEl)

  const handleMenuClick = (event, wh) => {
    setAnchorEl(event.currentTarget)
    setMenuId(wh._id)
    setSelectedWarehouse(wh)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuId(null)
  }

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/warehouses', { params: { limit: 100 } })
      if (response.data.success) {
        setWarehouses(response.data.data?.warehouses || [])
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
      toast.error('Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const handleEdit = () => {
    handleMenuClose()
    setFormOpen(true)
  }

  const handleDelete = async () => {
    handleMenuClose()
    if (!selectedWarehouse) return

    if (confirm(`Are you sure you want to deactivate ${selectedWarehouse.name}?`)) {
      try {
        const response = await axios.delete(`/api/warehouses/${selectedWarehouse._id}`)
        if (response.data.success) {
          toast.success('Warehouse deactivated')
          fetchWarehouses()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to deactivate warehouse')
      }
    }
  }

  const handleAdd = () => {
    setSelectedWarehouse(null)
    setFormOpen(true)
  }

  return (
    <Box sx={{ pb: 24, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <HeaderWrapper>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h6' sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
          Warehouses
        </Typography>
        <Box sx={{ width: 40 }} />
      </HeaderWrapper>

      <Box sx={{ p: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {warehouses.map((wh) => (
              <Grid item xs={12} key={wh._id}>
                <WarehouseCard 
                  onClick={() => router.push(`/warehouses/${wh._id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <CardContent sx={{ p: '20px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <IconBox>
                        <Icon icon='mdi:warehouse' fontSize='1.75rem' />
                      </IconBox>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                          {wh.name}
                        </Typography>
                        <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                          <Icon icon='mdi:map-marker' fontSize='0.9rem' sx={{ mr: 1 }} />
                          {wh.city} • {wh.code}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.8rem' }}>
                          {wh.address}
                        </Typography>
                      </Box>
                      <IconButton 
                        size='small' 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMenuClick(e, wh)
                        }}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Icon icon='mdi:dots-vertical' />
                      </IconButton>
                    </Box>
                  </CardContent>
                </WarehouseCard>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && warehouses.length === 0 && (
          <Box sx={{ py: 20, textAlign: 'center', opacity: 0.5 }}>
            <Icon icon='mdi:warehouse-off' fontSize='3rem' />
            <Typography sx={{ mt: 2 }}>No warehouses found</Typography>
          </Box>
        )}
      </Box>

      {/* Speed Dial / FAB */}
      <Fab
        variant='extended'
        size='medium'
        onClick={handleAdd}
        sx={{ 
          position: 'fixed',
          bottom: 30,
          right: 30,
          bgcolor: '#00AEEF', 
          color: 'white', 
          '&:hover': { bgcolor: '#0096ce' },
          textTransform: 'none',
          px: 6,
          boxShadow: '0 4px 10px rgba(0, 174, 239, 0.3)'
        }}
      >
        <Icon icon='mdi:plus' sx={{ mr: 2 }} />
        Add Warehouse
      </Fab>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <Icon icon='mdi:pencil-outline' sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Icon icon='mdi:delete-outline' sx={{ mr: 2 }} />
          Deactivate
        </MenuItem>
      </Menu>

      {/* Warehouse Form Modal */}
      <WarehouseForm 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        onSuccess={fetchWarehouses}
        warehouse={selectedWarehouse}
      />
    </Box>
  )
}

export default WarehousesPage
