import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { styled, alpha, useTheme } from '@mui/material/styles'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** API Imports
import axios from 'src/api/axiosInstance'
import toast from 'react-hot-toast'

const RedBalanceCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F02B2B 0%, #D32F2F 100%)',
  color: theme.palette.common.white,
  borderRadius: 24,
  padding: theme.spacing(6),
  boxShadow: `0 10px 30px -10px ${alpha('#D32F2F', 0.5)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    filter: 'blur(20px)'
  }
}))

const StatementItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px -5px ${alpha(theme.palette.common.black, 0.15)}`
  }
}))

const CustomTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 100,
  borderRadius: 12,
  marginRight: theme.spacing(2),
  '&.Mui-selected': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: `${theme.palette.common.white} !important`
  }
}))

const Ledger = () => {
  const theme = useTheme()
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [ledgerData, setLedgerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/customers')
        if (response.data.success) {
          const list = response.data.data.map(c => ({
            ...c,
            label: `${c.shopName} - ${c.name}`
          }))
          setCustomers(list)
          if (list.length > 0) {
            setSelectedCustomer(list[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error)
        toast.error('Failed to load customers')
      }
    }
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      fetchLedger(selectedCustomer._id)
    }
  }, [selectedCustomer, filter])

  const fetchLedger = async (customerId) => {
    setLoading(true)
    try {
      let url = `/api/ledger/${customerId}`
      const params = {}
      const now = new Date()
      if (filter === 'thisMonth') {
        params.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      } else if (filter === 'lastMonth') {
        params.dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
        params.dateTo = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
      }
      
      const response = await axios.get(url, { params })
      if (response.data.success) {
        setLedgerData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch ledger:', error)
      toast.error('Failed to load ledger details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' sx={{ mb: 6, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
        Customer Ledger
      </Typography>

      <Grid container spacing={6}>
        {/* Store Selector */}
        <Grid item xs={12}>
          <Autocomplete
            value={selectedCustomer}
            onChange={(event, newValue) => setSelectedCustomer(newValue)}
            options={customers}
            getOptionLabel={(option) => option.label || ''}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder='Search Store...' 
                variant='outlined'
                sx={{ 
                  bgcolor: 'background.paper', 
                  borderRadius: 4,
                  '& fieldset': { borderRadius: 3, border: `1px solid ${theme.palette.divider}` }
                }}
              />
            )}
          />
        </Grid>

        {loading && !ledgerData ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Grid>
        ) : ledgerData ? (
          <>
            {/* Balance Highlight Card */}
            <Grid item xs={12}>
              <RedBalanceCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                        <Icon icon='mdi:alert-circle-outline' fontSize='1.2rem' />
                      </Avatar>
                      <Typography variant='body2' sx={{ opacity: 0.9 }}>
                        Current Balance (Due)
                      </Typography>
                    </Stack>
                    <Typography variant='h2' sx={{ fontWeight: 800 }}>
                      Rs {ledgerData.outstanding}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 44, height: 44 }}>
                    <Icon icon='mdi:wallet-outline' />
                  </Avatar>
                </Box>

                <Box sx={{ 
                  mt: 6, 
                  py: 4, 
                  px: 6, 
                  borderRadius: 4, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(5px)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1px 1fr',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='caption' sx={{ opacity: 0.8, display: 'block', mb: 1 }}>Billings</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>Rs {ledgerData.totalDebit}</Typography>
                  </Box>
                  <Box sx={{ height: 40, bgcolor: 'rgba(255,255,255,0.2)', width: '1px' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='caption' sx={{ opacity: 0.8, display: 'block', mb: 1 }}>Total Paid</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>Rs {ledgerData.totalCredit}</Typography>
                  </Box>
                </Box>
              </RedBalanceCard>
            </Grid>

            {/* Filter Tabs */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <TabContext value={filter}>
                <TabList onChange={(e, v) => setFilter(v)} sx={{ border: 'none', '& .MuiTabs-indicator': { display: 'none' } }}>
                  <CustomTab value='all' label='All' />
                  <CustomTab value='thisMonth' label='This Month' />
                  <CustomTab value='lastMonth' label='Last Month' />
                </TabList>
              </TabContext>
            </Grid>

            {/* Statement Section */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 4, fontWeight: 700 }}>Statement</Typography>
              <Stack spacing={3}>
                {ledgerData.ledger.map((entry) => (
                  <StatementItem key={entry._id}>
                    <CardContent sx={{ py: '16px !important', px: '20px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Avatar sx={{ 
                            bgcolor: entry.debit > 0 ? alpha('#D32F2F', 0.1) : alpha('#2E7D32', 0.1),
                            color: entry.debit > 0 ? '#D32F2F' : '#2E7D32',
                            width: 40,
                            height: 40,
                            borderRadius: 2
                          }}>
                            <Icon icon={(entry.debit > 0 || entry.type === 'INVOICE') ? 'mdi:plus' : 'mdi:minus'} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                              {ledgerData.customer?.shopName || 'Store'} - {entry.description || (entry.type === 'INVOICE' ? 'Product Purchase' : 'Payment Received')}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {new Date(entry.entryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ 
                          fontWeight: 700, 
                          color: entry.debit > 0 ? '#D32F2F' : '#2E7D32',
                          fontSize: '1.1rem'
                        }}>
                          {entry.debit > 0 ? `+ Rs ${entry.debit}` : `- Rs ${entry.credit}`}
                        </Typography>
                      </Box>
                    </CardContent>
                  </StatementItem>
                ))}
                {ledgerData.ledger.length === 0 && (
                  <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
                    <Icon icon='mdi:file-search-outline' fontSize='3rem' />
                    <Typography sx={{ mt: 2 }}>No transactions found for this period</Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 20 }}>
            <Icon icon='mdi:store-search-outline' fontSize='4rem' color='disabled' />
            <Typography variant='h6' color='text.secondary' sx={{ mt: 4 }}>Please select a store to view ledger</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default Ledger
