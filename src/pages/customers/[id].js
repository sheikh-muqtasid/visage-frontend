import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import { styled, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

// ** Custom Components
import ShopForm from 'src/views/customers/ShopForm'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'

const HeaderWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#00AEEF',
  padding: theme.spacing(6, 6, 12, 6),
  color: theme.palette.common.white,
  position: 'relative',
  textAlign: 'center'
}))

const InfoItem = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.divider}`,
  '& .MuiCardContent-root': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(4, 5)
  }
}))

const IconContainer = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
  marginRight: theme.spacing(4),
  color: theme.palette.text.secondary
}))

const StoreDetail = () => {
  // ** State
  const [activeTab, setActiveTab] = useState('info')
  const [customer, setCustomer] = useState(null)
  const [route, setRoute] = useState(null)
  const [ledgerData, setLedgerData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [openEdit, setOpenEdit] = useState(false)

  const router = useRouter()
  const { id } = router.query

  const fetchData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [custRes, routeRes, ledgerRes, ordersRes] = await Promise.all([
        axios.get(`/api/customers/${id}`),
        axios.get('/api/routes?limit=100'),
        axios.get(`/api/ledger/${id}`),
        axios.get(`/api/orders?customerId=${id}&limit=100`)
      ])

      if (custRes.data.success) setCustomer(custRes.data.data)
      if (ledgerRes.data.success) setLedgerData(ledgerRes.data.data)
      if (ordersRes.data.success) setOrders(ordersRes.data.data.orders || [])

      // Find assigned route
      if (routeRes.data.success) {
        const assignedRoute = routeRes.data.data.routes.find(r => 
          r.customers?.some(c => (typeof c === 'object' ? c._id : c) === id)
        )
        setRoute(assignedRoute)
      }
    } catch (error) {
      console.error('Error fetching store details:', error)
      toast.error('Failed to load store information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await axios.delete(`/api/customers/${id}`)
        toast.success('Store deleted successfully')
        router.push('/customers')
      } catch (error) {
        toast.error('Failed to delete store')
      }
    }
  }

  if (loading || !customer) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header Section */}
      <HeaderWrapper>
        <IconButton 
          sx={{ position: 'absolute', top: 20, left: 20, color: 'white' }} 
          onClick={() => router.push('/customers')}
        >
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        
        <IconButton 
          sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }} 
          onClick={handleDelete}
        >
          <Icon icon='mdi:delete-outline' />
        </IconButton>

        <Stack spacing={4} alignItems='center' sx={{ mt: 4 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'white', 
              color: '#00AEEF', 
              fontSize: '2rem', 
              fontWeight: 700 
            }}
          >
            {customer.shopName?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant='h4' sx={{ color: 'white', fontWeight: 700 }}>
            {customer.shopName}
          </Typography>

          <Stack direction='row' spacing={3}>
            <Button 
              variant='contained' 
              size='small'
              startIcon={<Icon icon='mdi:phone' />}
              sx={{ bgcolor: alpha('#fff', 0.2), boxShadow: 'none', borderRadius: 2, textTransform: 'none' }}
              href={`tel:${customer.mobileNumber}`}
            >
              Call
            </Button>
            <Button 
              variant='contained' 
              size='small'
              startIcon={<Icon icon='mdi:pencil-outline' />}
              sx={{ bgcolor: alpha('#fff', 0.2), boxShadow: 'none', borderRadius: 2, textTransform: 'none' }}
              onClick={() => setOpenEdit(true)}
            >
              Edit Info
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, val) => setActiveTab(val)}
            sx={{ 
              '& .MuiTabs-indicator': { backgroundColor: 'white', height: 4, borderRadius: '4px 4px 0 0' },
              '& .MuiTab-root': { color: alpha('#fff', 0.7), fontWeight: 600, fontSize: '0.95rem' },
              '& .Mui-selected': { color: 'white !important' }
            }}
          >
            <Tab label='Info' value='info' />
            <Tab label='Ledger' value='ledger' />
            <Tab label='Orders' value='orders' />
          </Tabs>
        </Box>
      </HeaderWrapper>

      {/* Content Section */}
      <Box sx={{ p: 6, maxWidth: 1200, mx: 'auto' }}>
        {activeTab === 'info' && (
          <Box>
            <InfoItem>
              <CardContent>
                <IconContainer><Icon icon='mdi:account-outline' /></IconContainer>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Owner Name</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{customer.name}</Typography>
                </Box>
              </CardContent>
            </InfoItem>

            <InfoItem>
              <CardContent>
                <IconContainer><Icon icon='mdi:phone-outline' /></IconContainer>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Phone Number</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{customer.mobileNumber}</Typography>
                </Box>
              </CardContent>
            </InfoItem>

            <InfoItem>
              <CardContent>
                <IconContainer><Icon icon='mdi:map-marker-outline' /></IconContainer>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Address</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{customer.address}</Typography>
                </Box>
              </CardContent>
            </InfoItem>

            <InfoItem>
              <CardContent>
                <IconContainer><Icon icon='mdi:road-variant' /></IconContainer>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Assigned Route</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{route?.name || 'Unassigned'}</Typography>
                </Box>
              </CardContent>
            </InfoItem>

            <Card sx={{ borderRadius: 4, mt: 6, border: `1px solid ${alpha('#00AEEF', 0.1)}`, bgcolor: alpha('#00AEEF', 0.02) }}>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 4, fontWeight: 700 }}>Financial Summary</Typography>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography color='text.secondary'>Outstanding Balance</Typography>
                  <Typography variant='h6' color='error.main' sx={{ fontWeight: 700 }}>
                    Rs {ledgerData?.openingBalance + (ledgerData?.ledger?.reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0) || 0)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 'ledger' && (
          <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid #eee' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Debit</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Credit</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary' }}>-</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Opening Balance</TableCell>
                  <TableCell align='right'>-</TableCell>
                  <TableCell align='right'>-</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 600 }}>{ledgerData?.openingBalance || 0}</TableCell>
                </TableRow>
                {ledgerData?.ledger?.map((entry, idx) => {
                  const runningBalance = ledgerData.openingBalance + ledgerData.ledger.slice(0, idx + 1).reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0)
                  return (
                    <TableRow key={entry._id}>
                      <TableCell>{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.description || entry.type}</TableCell>
                      <TableCell align='right' sx={{ color: 'error.main' }}>{entry.debit || '-'}</TableCell>
                      <TableCell align='right' sx={{ color: 'success.main' }}>{entry.credit || '-'}</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 600 }}>{runningBalance}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 'orders' && (
          <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid #eee' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order._id}>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{order.orderNumber}</TableCell>
                    <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size='small' 
                        color={order.status === 'DELIVERED' ? 'success' : 'primary'}
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>Rs {order.totalAmount}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow><TableCell colSpan={4} align='center' sx={{ py: 10 }}>No orders found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Edit Form Dialog */}
      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth='sm'
        sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}
      >
        <ShopForm 
          shop={customer} 
          isEdit={true} 
          onClose={() => {
            setOpenEdit(false)
            fetchData()
          }} 
        />
      </Dialog>
    </Box>
  )
}

StoreDetail.acl = {
  action: 'read',
  subject: 'acl-page'
}

export default StoreDetail
