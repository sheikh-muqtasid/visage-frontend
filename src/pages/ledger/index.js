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
import Button from '@mui/material/Button'

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
  const [activeTab, setActiveTab] = useState('overview')
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [ledgerData, setLedgerData] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [agingData, setAgingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  // Fetch Summary Data (Overview)
  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/ledger/outstanding-summary')
      if (response.data.success) {
        setSummaryData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
      toast.error('Failed to load receivables summary')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Aging Report
  const fetchAging = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/ledger/aging-report')
      if (response.data.success) {
        setAgingData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch aging report:', error)
      toast.error('Failed to load aging analysis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/customers', { params: { limit: 1000 } })
        if (response.data.success) {
          const list = response.data.data.customers.map(c => ({
            ...c,
            label: `${c.shopName} - ${c.name}`
          }))
          setCustomers(list)
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      }
    }
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchSummary()
    } else if (activeTab === 'aging') {
      fetchAging()
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedCustomer && activeTab === 'ledger') {
      fetchLedger(selectedCustomer._id)
    }
  }, [selectedCustomer, filter, activeTab])

  const fetchLedger = async (customerId) => {
    if (!customerId) return
    setLoading(true)
    try {
      const params = { limit: 100 }
      const now = new Date()
      
      if (filter === 'thisMonth') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        params.dateFrom = firstDay.toISOString()
      } else if (filter === 'lastMonth') {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        params.dateFrom = firstDayLastMonth.toISOString()
        params.dateTo = lastDayLastMonth.toISOString()
      }
      
      const response = await axios.get(`/api/ledger/${customerId}`, { params })
      if (response.data.success) {
        setLedgerData(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch ledger')
      }
    } catch (error) {
      console.error('Failed to fetch ledger:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load ledger details'
      toast.error(errorMsg)
      setLedgerData(null)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!ledgerData || !ledgerData.ledger) return

    const headers = ['Date', 'Description', 'Type', 'Debit (Out)', 'Credit (In)', 'Balance']
    let runningBalance = ledgerData.openingBalance || 0
    
    const rows = [
      ['Before Opening', 'Opening Balance', '-', '-', '-', runningBalance],
      ...ledgerData.ledger.map(entry => {
        runningBalance += (entry.debit || 0) - (entry.credit || 0)
        return [
          new Date(entry.entryDate).toLocaleDateString(),
          entry.description || (entry.type === 'INVOICE' ? 'Product Purchase' : 'Payment Received'),
          entry.type,
          entry.debit || 0,
          entry.credit || 0,
          runningBalance
        ]
      })
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Ledger_${ledgerData.customer.shopName}_${filter}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Statement downloaded')
  }

  const renderOverview = () => {
    if (!summaryData) return null
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <RedBalanceCard sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant='caption' sx={{ opacity: 0.9, display: 'block', mb: 1 }}>Total System Outstanding</Typography>
                <Typography variant='h2' sx={{ fontWeight: 800 }}>Rs {summaryData.totalSystemOutstanding?.toLocaleString()}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <Icon icon='mdi:cash-multiple' fontSize='2rem' />
              </Avatar>
            </Box>
          </RedBalanceCard>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='h6' sx={{ mb: 4, fontWeight: 700 }}>Customer Balances</Typography>
          <Stack spacing={3}>
            {summaryData.summary?.map((item) => (
              <StatementItem key={item.customerId} onClick={() => {
                setSelectedCustomer(customers.find(c => c._id === item.customerId) || { _id: item.customerId, shopName: item.shopName, name: item.customerName })
                setActiveTab('ledger')
              }} sx={{ cursor: 'pointer' }}>
                <CardContent sx={{ py: '14px !important', px: '20px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        {item.shopName?.[0] || 'S'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{item.shopName}</Typography>
                        <Typography variant='caption' color='text.secondary'>{item.customerName}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>Outstanding</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#D32F2F', fontSize: '1.1rem' }}>Rs {item.totalOutstanding?.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </StatementItem>
            ))}
          </Stack>
        </Grid>
      </Grid>
    )
  }

  const renderLedger = () => {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Autocomplete
            value={selectedCustomer}
            onChange={(event, newValue) => setSelectedCustomer(newValue)}
            options={customers}
            getOptionLabel={(option) => option?.label || option?.shopName || ''}
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
            <Grid item xs={12}>
              <RedBalanceCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                        <Icon icon='mdi:alert-circle-outline' fontSize='1.2rem' />
                      </Avatar>
                      <Typography variant='body2' sx={{ opacity: 0.9 }}>Current Balance (Due)</Typography>
                    </Stack>
                    <Typography variant='h2' sx={{ fontWeight: 800 }}>Rs {ledgerData.outstanding?.toLocaleString()}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 44, height: 44 }}>
                    <Icon icon='mdi:wallet-outline' />
                  </Avatar>
                </Box>
                <Box sx={{
                  mt: 6, py: 4, px: 6, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
                  display: 'grid', gridTemplateColumns: '1fr 1px 1fr', alignItems: 'center', gap: 4
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='caption' sx={{ opacity: 0.8, display: 'block', mb: 1 }}>Billings</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>Rs {ledgerData.totalDebit?.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ height: 40, bgcolor: 'rgba(255,255,255,0.2)', width: '1px' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='caption' sx={{ opacity: 0.8, display: 'block', mb: 1 }}>Total Paid</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>Rs {ledgerData.totalCredit?.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </RedBalanceCard>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                <TabContext value={filter}>
                  <TabList onChange={(e, v) => setFilter(v)} sx={{ border: 'none', '& .MuiTabs-indicator': { display: 'none' } }}>
                    <CustomTab value='all' label='All' />
                    <CustomTab value='thisMonth' label='This Month' />
                    <CustomTab value='lastMonth' label='Last Month' />
                  </TabList>
                </TabContext>
                <Button variant='contained' startIcon={<Icon icon='mdi:download-outline' />} onClick={downloadCSV} sx={{ borderRadius: 3, px: 6 }}>
                  Download Statement
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 4, fontWeight: 700 }}>Statement Details</Typography>
              <Stack spacing={3}>
                {/* List entries */}
                {ledgerData.ledger?.length > 0 ? (
                  ledgerData.ledger.map((entry) => (
                    <StatementItem key={entry._id}>
                      <CardContent sx={{ py: '16px !important', px: '20px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Avatar sx={{
                              bgcolor: entry.debit > 0 ? alpha('#D32F2F', 0.1) : alpha('#2E7D32', 0.1),
                              color: entry.debit > 0 ? '#D32F2F' : '#2E7D32',
                              width: 40, height: 40, borderRadius: 2
                            }}>
                              <Icon icon={(entry.debit > 0 || entry.type === 'INVOICE') ? 'mdi:plus' : 'mdi:minus'} />
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                {entry.description || (entry.type === 'INVOICE' ? 'Product Purchase' : entry.type === 'PAYMENT' ? 'Payment Received' : entry.type)}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {new Date(entry.entryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography sx={{ fontWeight: 700, color: entry.debit > 0 ? '#D32F2F' : '#2E7D32', fontSize: '1.1rem' }}>
                            {entry.debit > 0 ? `+ Rs ${entry.debit?.toLocaleString()}` : `- Rs ${entry.credit?.toLocaleString()}`}
                          </Typography>
                        </Box>
                      </CardContent>
                    </StatementItem>
                  ))
                ) : (
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
    )
  }

  const renderAging = () => {
    if (!agingData) return null
    const buckets = [
      { label: '0 - 30 Days', value: agingData.summary?.bucket0to30, color: '#2E7D32' },
      { label: '31 - 60 Days', value: agingData.summary?.bucket31to60, color: '#FFA000' },
      { label: '61 - 90 Days', value: agingData.summary?.bucket61to90, color: '#F57C00' },
      { label: '90+ Days', value: agingData.summary?.bucket90Plus, color: '#D32F2F' }
    ]

    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 6 }}>
              <Typography variant='h6' sx={{ mb: 6, fontWeight: 700 }}>Aging Summary</Typography>
              <Grid container spacing={4}>
                {buckets.map((bucket) => (
                  <Grid item xs={6} md={3} key={bucket.label}>
                    <Box sx={{ 
                      p: 4, borderRadius: 4, border: `1px solid ${alpha(bucket.color, 0.2)}`, 
                      bgcolor: alpha(bucket.color, 0.05), textAlign: 'center' 
                    }}>
                      <Typography variant='caption' sx={{ color: bucket.color, fontWeight: 600, display: 'block', mb: 1 }}>{bucket.label}</Typography>
                      <Typography sx={{ fontWeight: 800 }}>Rs {bucket.value?.toLocaleString() || 0}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant='h6' sx={{ mb: 4, fontWeight: 700 }}>Breakdown by Customer</Typography>
          <Stack spacing={3}>
            {agingData.byCustomer?.map((item) => (
              <Card key={item.customerId} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <CardContent sx={{ p: '16px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar size='small'>{item.shopName?.[0]}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{item.shopName}</Typography>
                        <Typography variant='caption' color='text.secondary'>{item.customerName}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: '#D32F2F' }}>Rs {item.total?.toLocaleString()}</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant='caption' display='block'>0-30</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{item.bucket0to30 > 0 ? item.bucket0to30.toLocaleString() : '-'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant='caption' display='block'>31-60</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{item.bucket31to60 > 0 ? item.bucket31to60.toLocaleString() : '-'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant='caption' display='block'>61-90</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{item.bucket61to90 > 0 ? item.bucket61to90.toLocaleString() : '-'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant='caption' display='block'>90+</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{item.bucket90Plus > 0 ? item.bucket90Plus.toLocaleString() : '-'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant='h4' sx={{ mb: 6, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
        Financial Ledger
      </Typography>

      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
        <TabContext value={activeTab}>
          <TabList onChange={(e, v) => setActiveTab(v)} sx={{ 
            bgcolor: 'background.paper', borderRadius: 4, p: 1,
            '& .MuiTabs-indicator': { display: 'none' } 
          }}>
            <CustomTab value='overview' label='Overview' />
            <CustomTab value='ledger' label='Detailed Ledger' />
            <CustomTab value='aging' label='Aging Report' />
          </TabList>
        </TabContext>
      </Box>

      {loading && activeTab !== 'ledger' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && activeTab === 'overview' && renderOverview()}
      {activeTab === 'ledger' && renderLedger()}
      {!loading && activeTab === 'aging' && renderAging()}
    </Box>
  )
}

Ledger.acl = {
  action: 'manage',
  subject: 'all'
}

export default Ledger
